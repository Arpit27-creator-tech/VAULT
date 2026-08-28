import React, { useState, useEffect } from 'react';
import { 
  X, Lock, Mail, LogIn, ArrowRight, ArrowLeft, Eye, EyeOff, 
  User, UserPlus, Sparkles, Loader2, KeyRound, RefreshCw, CheckCircle2, ShieldAlert
} from 'lucide-react';
import { toast } from 'sonner';
import { authAPI } from '../services/api.js';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [authMode, setAuthMode] = useState('signin'); // 'signin' | 'register' | 'forgot'
  const [loading, setLoading] = useState(false);
  
  // Sign In State
  const [identifier, setIdentifier] = useState(''); 
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register State
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Email Verification OTP State
  const [otpStep, setOtpStep] = useState('form'); // 'form' | 'verify'
  const [verificationCode, setVerificationCode] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [fallbackCode, setFallbackCode] = useState('');

  // Forgot Password State
  const [forgotStep, setForgotStep] = useState('request'); // 'request' | 'reset'
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Check URL parameters for direct reset links (e.g. ?resetToken=...&email=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get('resetToken');
    const emailParam = params.get('email');

    if (tokenParam && emailParam) {
      setAuthMode('forgot');
      setForgotStep('reset');
      setResetToken(tokenParam);
      setForgotEmail(emailParam);
    }
  }, []);

  // Countdown timer for resending OTP
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      toast.error("Oops! Don't forget your email or username!");
      return;
    }
    if (!password.trim()) {
      toast.error("Oops! Enter your secret password!");
      return;
    }

    setLoading(true);
    try {
      const data = await authAPI.login(identifier.trim(), password);
      onLoginSuccess(data.user);
      toast.success(`🎉 Woohoo! Welcome back, ${data.user.callsign}!`);
      onClose();
    } catch (err) {
      // Fallback to client-side profile if backend is unreachable
      if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
        const username = identifier.includes('@') ? identifier.split('@')[0] : identifier.trim();
        const displayName = username.charAt(0).toUpperCase() + username.slice(1);
        const userProfile = {
          id: `user-${Date.now()}`,
          callsign: displayName,
          email: identifier.includes('@') ? identifier.trim() : `${username.toLowerCase()}@example.com`,
          role: 'Canopy Hacker', level: 1, xp: 1200, rank: 'Forest Explorer',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
          stats: { missionsCompleted: 0, winRate: 100, vaultsCracked: 0, alarmsTripped: 0, fastestTime: '--', csMastery: 75, physicsMastery: 70, chemMastery: 70, mathMastery: 75 },
          history: [], badges: ['Forest Ranger']
        };
        onLoginSuccess(userProfile);
        toast.success(`🎉 Welcome back, ${displayName}! (Offline mode)`);
        onClose();
      } else {
        toast.error(err.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Step 1 of Register: Validate inputs & dispatch 6-digit email OTP
   */
  const handleRequestVerification = async (e) => {
    e.preventDefault();
    if (!regUsername.trim()) {
      toast.error("Oops! Pick a cool username!");
      return;
    }
    if (!regEmail.trim()) {
      toast.error("Oops! Please enter your email address!");
      return;
    }
    if (!regPassword.trim() || regPassword.length < 6) {
      toast.error("Password must be at least 6 characters!");
      return;
    }

    setLoading(true);
    try {
      const data = await authAPI.sendVerification(regEmail.trim());
      if (data?.previewCode) {
        setFallbackCode(data.previewCode);
      }
      setOtpStep('verify');
      setResendCooldown(60);
      toast.success(`📧 6-digit clearance code sent to ${regEmail.trim()}!`);
    } catch (err) {
      if (err.message?.includes('User exists')) {
        toast.error("An account with this email already exists. Please sign in!");
        setAuthMode('signin');
        setIdentifier(regEmail.trim());
      } else if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
        handleFinalRegistrationDirect();
      } else {
        toast.error(err.message || "Failed to send verification code. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Step 2 of Register: Verify OTP & create account
   */
  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    if (!verificationCode.trim() || verificationCode.trim().length < 6) {
      toast.error("Please enter the complete 6-digit clearance code!");
      return;
    }

    setLoading(true);
    try {
      const data = await authAPI.register(
        regUsername.trim(),
        regEmail.trim(),
        regPassword,
        verificationCode.trim()
      );
      onLoginSuccess(data.user);
      toast.success(`🌟 Email Verified! Welcome to the crew, ${data.user.callsign}! (+300 Starter Bonus XP)`);
      onClose();
    } catch (err) {
      toast.error(err.message || 'Verification failed. The code may be incorrect or expired.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Direct registration fallback when offline
   */
  const handleFinalRegistrationDirect = async () => {
    try {
      const data = await authAPI.register(regUsername.trim(), regEmail.trim(), regPassword);
      onLoginSuccess(data.user);
      toast.success(`🌟 Welcome, ${data.user.callsign}!`);
      onClose();
    } catch (err) {
      const displayName = regUsername.trim();
      const newProfile = {
        id: `user-${Date.now()}`,
        callsign: displayName,
        email: regEmail.trim(),
        role: 'Canopy Hacker', level: 1, xp: 1500, rank: 'Junior Ranger',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
        stats: { missionsCompleted: 0, winRate: 100, vaultsCracked: 0, alarmsTripped: 0, fastestTime: '--', csMastery: 75, physicsMastery: 70, chemMastery: 70, mathMastery: 75 },
        history: [], badges: ['Junior Ranger', 'New Explorer']
      };
      onLoginSuccess(newProfile);
      toast.success(`🌟 Welcome, ${displayName}! (Offline mode)`);
      onClose();
    }
  };

  /**
   * Resend code handler for registration
   */
  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    try {
      const data = await authAPI.sendVerification(regEmail.trim());
      if (data?.previewCode) {
        setFallbackCode(data.previewCode);
      }
      setResendCooldown(60);
      toast.success("🔄 New 6-digit clearance code sent to your email!");
    } catch (err) {
      toast.error(err.message || "Could not resend code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Request Password Reset Email
   */
  const handleRequestPasswordReset = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      toast.error("Please enter your registered email address!");
      return;
    }

    setLoading(true);
    try {
      await authAPI.forgotPassword(forgotEmail.trim());
      setForgotStep('reset');
      setResendCooldown(60);
      toast.success(`📬 Password reset link & code sent to ${forgotEmail.trim()}!`);
    } catch (err) {
      toast.error(err.message || "Failed to send password reset code.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Submit New Password with Code / Token
   */
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!resetToken && (!resetCode.trim() || resetCode.trim().length < 6)) {
      toast.error("Please enter the 6-digit reset code!");
      return;
    }
    if (!newPassword.trim() || newPassword.length < 6) {
      toast.error("New password must be at least 6 characters!");
      return;
    }

    setLoading(true);
    try {
      await authAPI.resetPassword({
        email: forgotEmail.trim(),
        code: resetCode.trim(),
        token: resetToken || undefined,
        newPassword: newPassword.trim()
      });

      toast.success("🎉 Password reset successfully! Please sign in with your new password.");
      setAuthMode('signin');
      setIdentifier(forgotEmail.trim());
      setPassword('');
      setForgotStep('request');
      setResetCode('');
      setResetToken('');
      setNewPassword('');

      // Clean URL if opened via query params
      if (window.history?.replaceState) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch (err) {
      toast.error(err.message || "Failed to reset password. The code may be expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      
      <div className="bg-[#0A2E1E] border-[4px] border-[#03140C] rounded-[2rem] p-6 sm:p-8 max-w-md w-full shadow-[8px_8px_0px_#020C07] relative space-y-5 animate-in zoom-in-95 duration-200 text-[#F0FDF4] my-auto">
        
        <div className="absolute -top-10 left-1/2 -translate-x-1/2">
          <div className="w-20 h-20 bg-[#10B981] border-[3.5px] border-[#03140C] rounded-full shadow-[4px_4px_0px_#020C07] flex items-center justify-center text-3xl select-none animate-bounce">
            {authMode === 'signin' ? '🦊' : authMode === 'forgot' ? '🔑' : otpStep === 'verify' ? '🔐' : '🚀'}
          </div>
        </div>

        <button 
          type="button"
          onClick={() => {
            if (authMode === 'forgot') {
              if (forgotStep === 'reset') {
                setForgotStep('request');
              } else {
                setAuthMode('signin');
              }
            } else if (otpStep === 'verify') {
              setOtpStep('form');
            } else {
              onClose();
            }
          }}
          className="absolute top-4 left-4 px-3 py-1.5 bg-[#020B06] border-2 border-[#03140C] text-emerald-300 hover:text-white hover:bg-[#072418] rounded-xl flex items-center space-x-1 shadow-[2px_2px_0px_#020C07] active:translate-x-0.5 active:translate-y-0.5 transition-all text-xs font-black font-game"
          title="Back"
        >
          <ArrowLeft className="w-4 h-4 stroke-[3]" />
          <span>Back</span>
        </button>

        <button 
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 bg-[#020B06] border-2 border-[#03140C] text-slate-300 hover:text-white hover:bg-red-950 rounded-full flex items-center justify-center shadow-[2px_2px_0px_#020C07] active:translate-x-0.5 active:translate-y-0.5 transition-all"
          aria-label="Close"
          title="Close modal"
        >
          <X className="w-5 h-5 stroke-[3]" />
        </button>

        <div className="text-center pt-6 space-y-1">
          <div className="inline-flex items-center space-x-1.5 bg-[#FBBF24] text-[#02140D] font-mono font-black text-xs uppercase px-3 py-1 border-2 border-[#03140C] rounded-full shadow-[2px_2px_0px_#020C07] rotate-[-2deg]">
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span>
              {authMode === 'signin' 
                ? 'OPERATIVE PORTAL' 
                : authMode === 'forgot'
                ? 'PASSWORD OVERRIDE'
                : otpStep === 'verify' 
                ? 'EMAIL CLEARANCE' 
                : 'JOIN THE SQUAD'}
            </span>
          </div>

          <h2 className="text-3xl font-black text-white font-game tracking-wider drop-shadow-sm pt-1">
            {authMode === 'signin' 
              ? 'Welcome Back!' 
              : authMode === 'forgot'
              ? (forgotStep === 'reset' ? 'Set New Password' : 'Reset Password')
              : otpStep === 'verify' 
              ? 'Check Your Inbox!' 
              : 'Create Hero!'}
          </h2>
          <p className="text-xs font-bold text-emerald-200">
            {authMode === 'signin' 
              ? 'Sign in to access your vaults & squad!' 
              : authMode === 'forgot'
              ? (forgotStep === 'reset' ? 'Enter the code from your email & choose new password' : 'We will send a 6-digit reset code to your email')
              : otpStep === 'verify' 
              ? `Enter the 6-digit code sent to ${regEmail}` 
              : 'Create your account with email verification!'}
          </p>
        </div>

        {/* Tab Switcher (only shown on initial login/register forms) */}
        {authMode !== 'forgot' && otpStep === 'form' && (
          <div className="flex bg-[#03140C] p-1.5 rounded-2xl border-2 border-[#020B06] shadow-inner font-game text-xs gap-1.5">
            <button
              type="button"
              onClick={() => {
                setAuthMode('signin');
                setOtpStep('form');
              }}
              className={`flex-1 py-2.5 rounded-xl font-black transition-all flex items-center justify-center space-x-1.5 ${
                authMode === 'signin'
                  ? 'bg-[#10B981] text-[#02140D] border-2 border-[#03140C] shadow-[3px_3px_0px_#020C07] translate-y-[-1px]'
                  : 'text-emerald-300 hover:text-white'
              }`}
            >
              <LogIn className="w-4 h-4 stroke-[3]" />
              <span>Sign In</span>
            </button>
            
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setOtpStep('form');
              }}
              className={`flex-1 py-2.5 rounded-xl font-black transition-all flex items-center justify-center space-x-1.5 ${
                authMode === 'register'
                  ? 'bg-[#FBBF24] text-[#02140D] border-2 border-[#03140C] shadow-[3px_3px_0px_#020C07] translate-y-[-1px]'
                  : 'text-emerald-300 hover:text-white'
              }`}
            >
              <UserPlus className="w-4 h-4 stroke-[3]" />
              <span>Register</span>
            </button>
          </div>
        )}

        {/* SIGN IN FORM */}
        {authMode === 'signin' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <form onSubmit={handleLogin} className="space-y-3.5 text-left">
              <div className="space-y-1">
                <label className="block text-xs font-black uppercase text-emerald-200 font-game">
                  Email ID or Username
                </label>
                <div className="relative">
                  <div className="w-5 h-5 absolute left-3.5 top-3 text-emerald-400 flex items-center justify-center">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input 
                    type="text"
                    required
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    placeholder="e.g. ranger_01 or name@email.com"
                    className="w-full bg-[#03140C] border-2 border-[#0E3D28] focus:border-[#10B981] rounded-2xl pl-11 pr-3.5 py-3 text-white text-sm font-bold shadow-inner outline-none transition-all placeholder:text-emerald-700 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black uppercase text-emerald-200 font-game">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('forgot');
                      setForgotStep('request');
                      setForgotEmail(identifier.includes('@') ? identifier.trim() : '');
                    }}
                    className="text-[11px] font-mono font-bold text-[#FBBF24] hover:underline"
                  >
                    Forgot Password? 🔑
                  </button>
                </div>
                <div className="relative">
                  <div className="w-5 h-5 absolute left-3.5 top-3 text-emerald-400 flex items-center justify-center">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input 
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#03140C] border-2 border-[#0E3D28] focus:border-[#10B981] rounded-2xl pl-11 pr-11 py-3 text-white text-sm font-bold shadow-inner outline-none transition-all placeholder:text-emerald-700 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-emerald-400 hover:text-white"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#10B981] text-[#02140D] font-black py-3.5 rounded-2xl border-[3px] border-[#03140C] shadow-[4px_4px_0px_#020C07] hover:bg-[#34D399] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all text-sm uppercase tracking-wider flex items-center justify-center space-x-2 font-game mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>LET'S GO! (SIGN IN)</span><ArrowRight className="w-5 h-5 stroke-[3]" /></>}
              </button>

              <div className="text-center pt-2 text-xs font-bold text-slate-300">
                New to VAULT?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setOtpStep('form');
                  }}
                  className="text-[#FBBF24] font-black hover:underline"
                >
                  Create an account! 🎉
                </button>
              </div>
            </form>
          </div>
        )}

        {/* REGISTER STEP 1: INITIAL DETAILS */}
        {authMode === 'register' && otpStep === 'form' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <form onSubmit={handleRequestVerification} className="space-y-3.5 text-left">
              
              <div className="space-y-1">
                <label className="block text-xs font-black uppercase text-emerald-200 font-game">
                  Hero Callsign / Username
                </label>
                <div className="relative">
                  <div className="w-5 h-5 absolute left-3.5 top-3 text-emerald-400 flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <input 
                    type="text"
                    required
                    value={regUsername}
                    onChange={e => setRegUsername(e.target.value)}
                    placeholder="e.g. Shadow_Ranger"
                    className="w-full bg-[#03140C] border-2 border-[#0E3D28] focus:border-[#10B981] rounded-2xl pl-11 pr-3.5 py-3 text-white text-sm font-bold shadow-inner outline-none transition-all placeholder:text-emerald-700 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-black uppercase text-emerald-200 font-game">
                  Email Address
                </label>
                <div className="relative">
                  <div className="w-5 h-5 absolute left-3.5 top-3 text-emerald-400 flex items-center justify-center">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input 
                    type="email"
                    required
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    placeholder="name@email.com"
                    className="w-full bg-[#03140C] border-2 border-[#0E3D28] focus:border-[#10B981] rounded-2xl pl-11 pr-3.5 py-3 text-white text-sm font-bold shadow-inner outline-none transition-all placeholder:text-emerald-700 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-black uppercase text-emerald-200 font-game">
                  Secret Password
                </label>
                <div className="relative">
                  <div className="w-5 h-5 absolute left-3.5 top-3 text-emerald-400 flex items-center justify-center">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input 
                    type={showRegPassword ? "text" : "password"}
                    required
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full bg-[#03140C] border-2 border-[#0E3D28] focus:border-[#10B981] rounded-2xl pl-11 pr-11 py-3 text-white text-sm font-bold shadow-inner outline-none transition-all placeholder:text-emerald-700 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3.5 top-3.5 text-emerald-400 hover:text-white"
                    aria-label={showRegPassword ? "Hide password" : "Show password"}
                  >
                    {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#FBBF24] text-[#02140D] font-black py-3.5 rounded-2xl border-[3px] border-[#03140C] shadow-[4px_4px_0px_#020C07] hover:bg-[#F59E0B] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all text-sm uppercase tracking-wider flex items-center justify-center space-x-2 font-game mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>SEND VERIFICATION CODE</span><ArrowRight className="w-5 h-5 stroke-[3]" /></>}
              </button>

              <div className="text-center pt-2 text-xs font-bold text-slate-300">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => setAuthMode('signin')}
                  className="text-[#10B981] font-black hover:underline"
                >
                  Sign in here! 🔑
                </button>
              </div>
            </form>
          </div>
        )}

        {/* REGISTER STEP 2: 6-DIGIT EMAIL CODE VERIFICATION */}
        {authMode === 'register' && otpStep === 'verify' && (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200 text-left">
            <form onSubmit={handleVerifyAndRegister} className="space-y-4">
              
              <div className="p-3 bg-[#020B06] border-2 border-[#10B981]/50 rounded-2xl text-center space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase block font-bold">Transmission Target:</span>
                <span className="text-sm font-mono font-bold text-[#FBBF24] block truncate">{regEmail}</span>
              </div>

              <div className="space-y-2 text-center">
                <label className="block text-xs font-black uppercase text-emerald-200 font-game">
                  Enter 6-Digit Clearance Code
                </label>
                
                <div className="relative">
                  <input 
                    type="text"
                    maxLength={6}
                    required
                    autoFocus
                    value={verificationCode}
                    onChange={e => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="w-full bg-[#03140C] border-2 border-[#10B981] focus:border-[#FBBF24] rounded-2xl py-3.5 text-center text-white text-2xl sm:text-3xl font-black font-mono tracking-[0.35em] shadow-inner outline-none transition-all placeholder:text-emerald-900 selection:bg-[#10B981] selection:text-[#02140D]"
                  />
                </div>
                <p className="text-[11px] text-slate-400 font-mono">
                  Code expires in 10 minutes. Check your inbox or spam folder.
                </p>
              </div>

              {fallbackCode && (
                <div className="p-2.5 bg-[#02180E] border border-[#10B981]/40 rounded-xl flex items-center justify-between px-3.5 shadow-sm animate-in fade-in duration-300">
                  <div className="text-left">
                    <span className="text-[10px] font-mono text-emerald-400 block font-bold uppercase tracking-wider">Fast Clearance Access</span>
                    <span className="text-xs font-mono font-bold text-slate-300">Backup Code: <strong className="text-[#FBBF24] font-black">{fallbackCode}</strong></span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setVerificationCode(fallbackCode)}
                    className="text-[11px] bg-[#10B981] hover:bg-[#34D399] text-[#02140D] font-black px-2.5 py-1 rounded-lg transition-all active:scale-95 uppercase font-game"
                  >
                    Auto-Fill
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || verificationCode.length < 6}
                className="w-full bg-[#10B981] text-[#02140D] font-black py-3.5 rounded-2xl border-[3px] border-[#03140C] shadow-[4px_4px_0px_#020C07] hover:bg-[#34D399] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all text-sm uppercase tracking-wider flex items-center justify-center space-x-2 font-game disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                    <span>VERIFY & ACTIVATE HERO!</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-emerald-950">
                <button
                  type="button"
                  onClick={() => setOtpStep('form')}
                  className="text-slate-400 hover:text-white underline"
                >
                  Change Email
                </button>

                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendCooldown > 0 || loading}
                  className={`flex items-center space-x-1 font-bold ${
                    resendCooldown > 0 
                      ? 'text-slate-500 cursor-not-allowed' 
                      : 'text-[#FBBF24] hover:underline'
                  }`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${resendCooldown > 0 ? '' : 'text-[#FBBF24]'}`} />
                  <span>
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                  </span>
                </button>
              </div>

            </form>
          </div>
        )}

        {/* FORGOT PASSWORD STEP 1: REQUEST EMAIL */}
        {authMode === 'forgot' && forgotStep === 'request' && (
          <div className="space-y-4 animate-in fade-in duration-150 text-left">
            <form onSubmit={handleRequestPasswordReset} className="space-y-3.5">
              
              <div className="space-y-1">
                <label className="block text-xs font-black uppercase text-emerald-200 font-game">
                  Registered Email Address
                </label>
                <div className="relative">
                  <div className="w-5 h-5 absolute left-3.5 top-3 text-emerald-400 flex items-center justify-center">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input 
                    type="email"
                    required
                    autoFocus
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    placeholder="name@email.com"
                    className="w-full bg-[#03140C] border-2 border-[#0E3D28] focus:border-[#FBBF24] rounded-2xl pl-11 pr-3.5 py-3 text-white text-sm font-bold shadow-inner outline-none transition-all placeholder:text-emerald-700 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#FBBF24] text-[#02140D] font-black py-3.5 rounded-2xl border-[3px] border-[#03140C] shadow-[4px_4px_0px_#020C07] hover:bg-[#F59E0B] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all text-sm uppercase tracking-wider flex items-center justify-center space-x-2 font-game mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>SEND RESET CODE & LINK</span><ArrowRight className="w-5 h-5 stroke-[3]" /></>}
              </button>

              <div className="text-center pt-2 text-xs font-bold text-slate-300">
                Remember your password?{' '}
                <button
                  type="button"
                  onClick={() => setAuthMode('signin')}
                  className="text-[#10B981] font-black hover:underline"
                >
                  Back to Sign In 🔑
                </button>
              </div>
            </form>
          </div>
        )}

        {/* FORGOT PASSWORD STEP 2: ENTER CODE & NEW PASSWORD */}
        {authMode === 'forgot' && forgotStep === 'reset' && (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200 text-left">
            <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5">
              
              <div className="p-3 bg-[#020B06] border-2 border-[#FBBF24]/50 rounded-2xl text-center space-y-0.5">
                <span className="text-[10px] font-mono text-slate-400 uppercase block font-bold">Reset Target:</span>
                <span className="text-sm font-mono font-bold text-[#FBBF24] block truncate">{forgotEmail}</span>
              </div>

              {!resetToken && (
                <div className="space-y-1">
                  <label className="block text-xs font-black uppercase text-emerald-200 font-game">
                    6-Digit Security Code
                  </label>
                  <input 
                    type="text"
                    maxLength={6}
                    required
                    autoFocus
                    value={resetCode}
                    onChange={e => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="w-full bg-[#03140C] border-2 border-[#FBBF24] focus:border-[#10B981] rounded-2xl py-2.5 text-center text-white text-2xl font-black font-mono tracking-[0.3em] shadow-inner outline-none transition-all placeholder:text-emerald-900"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-xs font-black uppercase text-emerald-200 font-game">
                  New Secret Password
                </label>
                <div className="relative">
                  <div className="w-5 h-5 absolute left-3.5 top-3 text-emerald-400 flex items-center justify-center">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input 
                    type={showNewPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full bg-[#03140C] border-2 border-[#0E3D28] focus:border-[#10B981] rounded-2xl pl-11 pr-11 py-3 text-white text-sm font-bold shadow-inner outline-none transition-all placeholder:text-emerald-700 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3.5 top-3.5 text-emerald-400 hover:text-white"
                    aria-label={showNewPassword ? "Hide password" : "Show password"}
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || (!resetToken && resetCode.length < 6) || newPassword.length < 6}
                className="w-full bg-[#10B981] text-[#02140D] font-black py-3.5 rounded-2xl border-[3px] border-[#03140C] shadow-[4px_4px_0px_#020C07] hover:bg-[#34D399] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all text-sm uppercase tracking-wider flex items-center justify-center space-x-2 font-game mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>OVERRIDE & SAVE PASSWORD</span><ArrowRight className="w-5 h-5 stroke-[3]" /></>}
              </button>

              <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-emerald-950">
                <button
                  type="button"
                  onClick={() => setForgotStep('request')}
                  className="text-slate-400 hover:text-white underline"
                >
                  Change Email
                </button>

                <button
                  type="button"
                  onClick={handleRequestPasswordReset}
                  disabled={resendCooldown > 0 || loading}
                  className={`flex items-center space-x-1 font-bold ${
                    resendCooldown > 0 
                      ? 'text-slate-500 cursor-not-allowed' 
                      : 'text-[#FBBF24] hover:underline'
                  }`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${resendCooldown > 0 ? '' : 'text-[#FBBF24]'}`} />
                  <span>
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                  </span>
                </button>
              </div>

            </form>
          </div>
        )}

      </div>
    </div>
  );
}
