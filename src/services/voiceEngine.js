// ============================================================
// V.A.U.L.T — Real-Time WebRTC Peer-to-Peer Voice Engine
// Ultra-Low Latency Opus HD Audio Mesh with Real Audio Processing
// ============================================================

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' }
  ]
};

class WebRTCVoiceEngine {
  constructor() {
    this.socket = null;
    this.roomCode = null;
    this.localStream = null;
    this.peers = new Map(); // socketId -> RTCPeerConnection
    this.audioElements = new Map(); // socketId -> HTMLAudioElement
    this.audioContext = null;
    this.analyser = null;
    this.volumeCheckInterval = null;
    this.isMuted = false;
    this.isDeafened = false;
    this.isConnected = false;
    this.onSpeakingListeners = new Set();
    this.onVolumeListeners = new Set();
    this.speakingThreshold = 0.04;
  }

  /**
   * Start real microphone capture and join WebRTC voice room
   */
  async startVoice(socket, roomCode) {
    if (!socket || !roomCode) return false;
    this.stopVoice(); // Clean up existing if any

    this.socket = socket;
    this.roomCode = roomCode.toUpperCase();

    try {
      // 1. Capture real microphone with HD voice processing
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000
        },
        video: false
      });

      // Apply initial mute state if set
      if (this.isMuted) {
        this.localStream.getAudioTracks().forEach(t => t.enabled = false);
      }

      // 2. Setup AudioContext for real-time visualizer & speaking detection
      this.setupAudioAnalyser();

      // 3. Setup Socket Signaling Listeners
      this.setupSignaling();

      // 4. Announce join to server
      this.socket.emit('voice:join', { roomCode: this.roomCode }, (res) => {
        if (res?.success && res?.peers) {
          // Connect to each existing peer in the room (initiate offer)
          res.peers.forEach(peer => {
            this.createPeerConnection(peer.socketId, true);
          });
        }
      });

      this.isConnected = true;
      console.log(`[VOICE] WebRTC Voice linked for room ${this.roomCode}`);
      return true;

    } catch (err) {
      console.warn('[VOICE] Microphone access failed or denied:', err);
      this.stopVoice();
      throw err;
    }
  }

  /**
   * Setup WebRTC signaling events via Socket.io
   */
  setupSignaling() {
    if (!this.socket) return;

    // A new user joined voice channel -> create peer connection (wait for their offer)
    this.socket.on('voice:user-joined', ({ socketId }) => {
      console.log('[VOICE] New peer joined channel:', socketId);
      this.createPeerConnection(socketId, true);
    });

    // Received WebRTC SDP offer/answer or ICE candidate
    this.socket.on('voice:signal', async ({ from, signal }) => {
      let pc = this.peers.get(from);
      if (!pc) {
        pc = this.createPeerConnection(from, false);
      }

      try {
        if (signal.sdp) {
          await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
          if (signal.sdp.type === 'offer') {
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            this.socket.emit('voice:signal', {
              to: from,
              signal: { sdp: pc.localDescription }
            });
          }
        } else if (signal.candidate) {
          await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
        }
      } catch (err) {
        console.error('[VOICE] Signaling error:', err);
      }
    });

    // User left voice channel
    this.socket.on('voice:user-left', ({ socketId }) => {
      this.closePeer(socketId);
    });
  }

  /**
   * Create RTCPeerConnection for a remote peer
   */
  createPeerConnection(peerSocketId, isInitiator = false) {
    if (this.peers.has(peerSocketId)) {
      return this.peers.get(peerSocketId);
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);
    this.peers.set(peerSocketId, pc);

    // Add local mic audio tracks to the peer connection
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        pc.addTrack(track, this.localStream);
      });
    }

    // ICE Candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && this.socket) {
        this.socket.emit('voice:signal', {
          to: peerSocketId,
          signal: { candidate: event.candidate }
        });
      }
    };

    // When remote audio track arrives -> play through audio element
    pc.ontrack = (event) => {
      console.log('[VOICE] Remote audio stream received from:', peerSocketId);
      const remoteStream = event.streams[0];
      
      let audio = this.audioElements.get(peerSocketId);
      if (!audio) {
        audio = new Audio();
        audio.autoplay = true;
        audio.muted = this.isDeafened;
        this.audioElements.set(peerSocketId, audio);
      }
      audio.srcObject = remoteStream;
      audio.play().catch(e => console.log('[VOICE] Autoplay audio error:', e));
    };

    // If initiator, create and send SDP offer
    if (isInitiator) {
      pc.onnegotiationneeded = async () => {
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          this.socket.emit('voice:signal', {
            to: peerSocketId,
            signal: { sdp: pc.localDescription }
          });
        } catch (err) {
          console.error('[VOICE] Negotiation offer error:', err);
        }
      };
    }

    return pc;
  }

  /**
   * Setup AudioContext Analyser for real-time microphone visualization
   */
  setupAudioAnalyser() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx || !this.localStream) return;

      this.audioContext = new AudioCtx();
      const source = this.audioContext.createMediaStreamSource(this.localStream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 64;
      this.analyser.smoothingTimeConstant = 0.8;
      source.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      let wasSpeaking = false;

      this.volumeCheckInterval = setInterval(() => {
        if (!this.analyser || this.isMuted) {
          if (wasSpeaking) {
            wasSpeaking = false;
            this.emitSpeaking(false);
          }
          this.emitVolume([8, 12, 10, 16, 12, 14, 8, 10]);
          return;
        }

        this.analyser.getByteFrequencyData(dataArray);
        
        let sum = 0;
        const bars = [];
        for (let i = 0; i < 8; i++) {
          const val = dataArray[i] || 0;
          sum += val;
          // Scale to pixel heights (8px to 28px)
          const barHeight = Math.max(8, Math.min(28, Math.round((val / 255) * 28)));
          bars.push(barHeight);
        }

        const avg = sum / (8 * 255);
        const isCurrentlySpeaking = avg > this.speakingThreshold;

        if (isCurrentlySpeaking !== wasSpeaking) {
          wasSpeaking = isCurrentlySpeaking;
          this.emitSpeaking(isCurrentlySpeaking);
        }

        this.emitVolume(bars);
      }, 80);

    } catch (e) {
      console.warn('[VOICE] Audio analyser error:', e);
    }
  }

  /**
   * Toggle or set microphone mute state
   */
  setMuted(muted) {
    this.isMuted = muted;
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = !muted;
      });
    }
    if (muted) {
      this.emitSpeaking(false);
    }
  }

  /**
   * Toggle or set audio deafen state
   */
  setDeafened(deafened) {
    this.isDeafened = deafened;
    this.audioElements.forEach(audio => {
      audio.muted = deafened;
    });
  }

  /**
   * Close a specific peer connection
   */
  closePeer(socketId) {
    const pc = this.peers.get(socketId);
    if (pc) {
      pc.close();
      this.peers.delete(socketId);
    }
    const audio = this.audioElements.get(socketId);
    if (audio) {
      audio.srcObject = null;
      audio.remove();
      this.audioElements.delete(socketId);
    }
  }

  /**
   * Stop all voice comms and release hardware resources
   */
  stopVoice() {
    if (this.socket && this.roomCode) {
      this.socket.emit('voice:leave', { roomCode: this.roomCode });
      this.socket.off('voice:user-joined');
      this.socket.off('voice:signal');
      this.socket.off('voice:user-left');
    }

    if (this.volumeCheckInterval) {
      clearInterval(this.volumeCheckInterval);
      this.volumeCheckInterval = null;
    }

    if (this.audioContext) {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
      this.analyser = null;
    }

    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    this.peers.forEach((pc) => pc.close());
    this.peers.clear();

    this.audioElements.forEach((audio) => {
      audio.srcObject = null;
      audio.remove();
    });
    this.audioElements.clear();

    this.isConnected = false;
    this.emitSpeaking(false);
    this.emitVolume([8, 8, 8, 8, 8, 8, 8, 8]);
  }

  onSpeaking(fn) {
    this.onSpeakingListeners.add(fn);
    return () => this.onSpeakingListeners.delete(fn);
  }

  onVolume(fn) {
    this.onVolumeListeners.add(fn);
    return () => this.onVolumeListeners.delete(fn);
  }

  emitSpeaking(val) {
    this.onSpeakingListeners.forEach(fn => fn(val));
  }

  emitVolume(bars) {
    this.onVolumeListeners.forEach(fn => fn(bars));
  }
}

export const voiceEngine = new WebRTCVoiceEngine();
