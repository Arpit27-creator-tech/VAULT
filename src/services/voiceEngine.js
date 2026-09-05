// ============================================================
// V.A.U.L.T — Real-Time WebRTC Peer-to-Peer Voice Engine
// Ultra-Low Latency Opus HD Audio Mesh with Real Audio Processing
// ============================================================

// ICE server config is fetched from the backend at runtime so TURN
// credentials are never shipped in the client-side JavaScript bundle.
let _iceConfigCache = null;

async function getIceConfig() {
  if (_iceConfigCache) return _iceConfigCache;

  try {
    // Resolve API base: same origin in production, explicit port in local dev
    const base = (window.location.port === '5173' || window.location.port === '3000')
      ? `${window.location.protocol}//${window.location.hostname}:5001`
      : window.location.origin;

    const res = await fetch(`${base}/api/ice-servers`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    _iceConfigCache = await res.json();
    console.log('[VOICE] ICE config loaded from server');
  } catch (err) {
    console.warn('[VOICE] Could not fetch ICE config — falling back to Google STUN only:', err.message);
    // Fallback: STUN-only (P2P will work on open networks; TURN relay unavailable)
    _iceConfigCache = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ],
      iceCandidatePoolSize: 10
    };
  }

  return _iceConfigCache;
}


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
    this.speakingThreshold = 0.03;
    this.isSignalingBound = false;
  }

  /**
   * Start real microphone capture and join WebRTC voice room
   */
  async startVoice(socket, roomCode) {
    if (!roomCode) {
      console.warn('[VOICE] Room code missing');
      return false;
    }

    // Clean up existing connections
    this.stopVoice();

    this.socket = socket;
    this.roomCode = roomCode.toString().trim().toUpperCase();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const msg = 'Microphone access is unavailable (requires HTTPS or http://localhost)';
      console.error('[VOICE]', msg);
      throw new Error(msg);
    }

    try {
      // 1. Fetch ICE config from backend (TURN credentials stay server-side)
      this.iceConfig = await getIceConfig();

      // 2. Capture microphone stream
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: false
      });

      // Apply initial mute state
      this.localStream.getAudioTracks().forEach(t => {
        t.enabled = !this.isMuted;
      });

      // 3. Setup AudioContext analyser for speaking visualizer
      this.setupAudioAnalyser();

      // 4. Setup Socket Signaling
      this.setupSignaling();

      // 5. Announce voice join to server
      if (this.socket) {
        this.socket.emit('voice:join', { roomCode: this.roomCode }, (res) => {
          if (res?.success && Array.isArray(res?.peers)) {
            console.log(`[VOICE] Joined room ${this.roomCode}, discovered ${res.peers.length} peers:`, res.peers);
            // Connect to each existing peer (this joining user is the initiator)
            res.peers.forEach(peer => {
              if (peer.socketId && peer.socketId !== this.socket.id) {
                this.createPeerConnection(peer.socketId, true);
              }
            });
          }
        });
      }

      this.isConnected = true;
      console.log(`[VOICE] Voice engine active for room ${this.roomCode}`);
      return true;

    } catch (err) {
      console.warn('[VOICE] Failed to start voice:', err);
      this.stopVoice();
      throw err;
    }
  }

  /**
   * Setup WebRTC signaling events via Socket.io
   */
  setupSignaling() {
    if (!this.socket) return;
    this.cleanupSignaling();

    // A new user joined voice channel -> create peer connection and wait for their offer
    this._onUserJoined = ({ socketId }) => {
      if (socketId && socketId !== this.socket?.id) {
        console.log('[VOICE] Remote peer joined channel:', socketId);
        this.createPeerConnection(socketId, false);
      }
    };

    // Received WebRTC SDP offer/answer or ICE candidate
    this._onSignal = async ({ from, signal }) => {
      if (!from || from === this.socket?.id) return;

      let pc = this.peers.get(from);
      if (!pc) {
        pc = this.createPeerConnection(from, false);
      }

      try {
        if (signal.sdp) {
          console.log(`[VOICE] Received SDP ${signal.sdp.type} from ${from}`);
          await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));

          // Drain queued ICE candidates received before remote description was set
          if (pc._iceCandidatesQueue && pc._iceCandidatesQueue.length > 0) {
            console.log(`[VOICE] Draining ${pc._iceCandidatesQueue.length} queued ICE candidates for ${from}`);
            for (const cand of pc._iceCandidatesQueue) {
              try {
                await pc.addIceCandidate(new RTCIceCandidate(cand));
              } catch (iceErr) {
                console.warn('[VOICE] Failed to add queued ICE candidate:', iceErr);
              }
            }
            pc._iceCandidatesQueue = [];
          }

          // If received offer, generate and send answer back
          if (signal.sdp.type === 'offer') {
            const answer = await pc.createAnswer({
              offerToReceiveAudio: true
            });
            await pc.setLocalDescription(answer);
            this.socket.emit('voice:signal', {
              to: from,
              signal: { sdp: pc.localDescription }
            });
            console.log(`[VOICE] Sent SDP answer to ${from}`);
          }
        } else if (signal.candidate) {
          if (!pc.remoteDescription) {
            if (!pc._iceCandidatesQueue) pc._iceCandidatesQueue = [];
            pc._iceCandidatesQueue.push(signal.candidate);
          } else {
            await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
          }
        }
      } catch (err) {
        console.error('[VOICE] Signaling error from:', from, err);
      }
    };

    // User left voice channel
    this._onUserLeft = ({ socketId }) => {
      if (socketId) {
        console.log('[VOICE] Remote peer left channel:', socketId);
        this.closePeer(socketId);
      }
    };

    this.socket.on('voice:user-joined', this._onUserJoined);
    this.socket.on('voice:signal', this._onSignal);
    this.socket.on('voice:user-left', this._onUserLeft);
    this.isSignalingBound = true;
  }

  cleanupSignaling() {
    if (this.socket && this.isSignalingBound) {
      if (this._onUserJoined) this.socket.off('voice:user-joined', this._onUserJoined);
      if (this._onSignal) this.socket.off('voice:signal', this._onSignal);
      if (this._onUserLeft) this.socket.off('voice:user-left', this._onUserLeft);
      this.isSignalingBound = false;
    }
  }

  /**
   * Create RTCPeerConnection for a remote peer
   */
  createPeerConnection(peerSocketId, isInitiator = false) {
    if (this.peers.has(peerSocketId)) {
      return this.peers.get(peerSocketId);
    }

    console.log(`[VOICE] Creating RTCPeerConnection for ${peerSocketId} (initiator: ${isInitiator})`);
    // Use the ICE config fetched from the server (no hardcoded credentials here)
    const pc = new RTCPeerConnection(this.iceConfig);
    pc._iceCandidatesQueue = [];
    this.peers.set(peerSocketId, pc);

    // Forward ICE candidates to remote peer via Socket.io
    pc.onicecandidate = (event) => {
      if (event.candidate && this.socket) {
        this.socket.emit('voice:signal', {
          to: peerSocketId,
          signal: { candidate: event.candidate }
        });
      }
    };

    // Handle incoming audio stream
    pc.ontrack = (event) => {
      console.log('[VOICE] Remote audio track received from:', peerSocketId, event);
      const remoteStream = (event.streams && event.streams[0]) ? event.streams[0] : new MediaStream([event.track]);
      
      let audio = this.audioElements.get(peerSocketId);
      if (!audio) {
        audio = document.createElement('audio');
        audio.autoplay = true;
        audio.playsInline = true;
        audio.volume = 1.0;
        audio.muted = this.isDeafened;
        audio.style.position = 'fixed';
        audio.style.bottom = '0';
        audio.style.left = '0';
        audio.style.width = '1px';
        audio.style.height = '1px';
        audio.style.opacity = '0.01';
        audio.style.pointerEvents = 'none';
        document.body.appendChild(audio);
        this.audioElements.set(peerSocketId, audio);
      }
      
      audio.srcObject = remoteStream;
      audio.play().catch(e => {
        console.warn('[VOICE] Autoplay blocked, unlocking on user gesture:', e);
        const unlock = () => {
          audio.play().catch(() => {});
          document.removeEventListener('click', unlock);
          document.removeEventListener('keydown', unlock);
        };
        document.addEventListener('click', unlock, { once: true });
        document.addEventListener('keydown', unlock, { once: true });
      });
    };

    // Connection state logging
    pc.oniceconnectionstatechange = () => {
      console.log(`[VOICE] ICE connection state [${peerSocketId}]: ${pc.iceConnectionState}`);
      if (pc.iceConnectionState === 'failed') {
        console.warn(`[VOICE] Connection failed for ${peerSocketId}, attempting ICE restart`);
        pc.restartIce?.();
      }
    };

    pc.onconnectionstatechange = () => {
      console.log(`[VOICE] Peer connection state [${peerSocketId}]: ${pc.connectionState}`);
    };

    // Add local microphone audio tracks
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        pc.addTrack(track, this.localStream);
      });
    }

    // If initiator, explicitly create and dispatch offer
    if (isInitiator) {
      this.sendOffer(pc, peerSocketId);
    }

    return pc;
  }

  /**
   * Explicitly create and transmit SDP offer to peer
   */
  async sendOffer(pc, peerSocketId) {
    try {
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        voiceActivityDetection: true
      });
      await pc.setLocalDescription(offer);
      if (this.socket) {
        this.socket.emit('voice:signal', {
          to: peerSocketId,
          signal: { sdp: pc.localDescription }
        });
        console.log(`[VOICE] Dispatched SDP offer to ${peerSocketId}`);
      }
    } catch (err) {
      console.error('[VOICE] Failed to create/send offer to:', peerSocketId, err);
    }
  }

  /**
   * Setup AudioContext Analyser for real-time microphone visualization
   */
  setupAudioAnalyser() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx || !this.localStream) return;

      this.audioContext = new AudioCtx();
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume().catch(() => {});
      }

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
      console.warn('[VOICE] Audio analyser initialization error:', e);
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
      audio.pause();
      if (audio.parentNode) audio.parentNode.removeChild(audio);
      this.audioElements.delete(socketId);
    }
  }

  /**
   * Stop all voice comms and release hardware resources
   */
  stopVoice() {
    if (this.socket && this.roomCode) {
      this.socket.emit('voice:leave', { roomCode: this.roomCode });
    }
    this.cleanupSignaling();

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
      audio.pause();
      if (audio.parentNode) audio.parentNode.removeChild(audio);
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
