import React, { useState } from 'react';
import { 
  X, Lock, Mail, LogIn, ArrowRight, ArrowLeft, Eye, EyeOff, 
  User, UserPlus, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [authMode, setAuthMode] = useState('signin'); // 'signin' | 'register'
  
  // Sign In fields
  const [identifier, setIdentifier] = useState(''); // email or username
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register fields (ONLY: User Name, Email, Password)
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  if (!isOpen) return null;

  const handleLogin = (e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      toast.error("Oops! Don't forget your email or username!");
      return;
    }
    if (!password.trim()) {
      toast.error("Oops! Enter your secret password!");
      return;
    }

    const username = identifier.includes('@') ? identifier.split('@')[0] : identifier.trim();
    const displayName = username.charAt(0).toUpperCase() + username.slice(1);

    const userProfile = {
      id: `user-${Date.now()}`,
      callsign: displayName,
      email: identifier.includes('@') ? identifier.trim() : `${username.toLowerCase()}@example.com`,
      role: 'Canopy Hacker',
      level: 1,
      xp: 1200,
      rank: 'Forest Explorer',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
      stats: {
        missionsCompleted: 0,
        winRate: 100,
        vaultsCracked: 0,
        alarmsTripped: 0,
        fastestTime: '--',
        csMastery: 75,
        physicsMastery: 70,
        chemMastery: 70,
        mathMastery: 75
      },
      history: [],
      badges: ['Forest Ranger']
    };

    onLoginSuccess(userProfile);
    toast.success(`🎉 Woohoo! Welcome back, ${displayName}!`);
    onClose();
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (!regUsername.trim()) {
      toast.error("Oops! Pick a cool username!");
      return;
    }
    if (!regEmail.trim()) {
      toast.error("Oops! Please enter your email address!");
      return;
    }
    if (!regPassword.trim()) {
      toast.error("Oops! Create a secret password!");
      return;
    }

    const displayName = regUsername.trim();

    const newProfile = {
      id: `user-${Date.now()}`,
      callsign: displayName,
      email: regEmail.trim(),
      role: 'Canopy Hacker',
      level: 1,
      xp: 1500,
      rank: 'Junior Ranger',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
      stats: {
        missionsCompleted: 0,
        winRate: 100,
        vaultsCracked: 0,
        alarmsTripped: 0,
        fastestTime: '--',
        csMastery: 75,
        physicsMastery: 70,
        chemMastery: 70,
        mathMastery: 75
      },
      history: [],
      badges: ['Junior Ranger', 'New Explorer']
    };

    onLoginSuccess(newProfile);
    toast.success(`🌟 Yay! Welcome to the crew, ${displayName}! +300 Bonus XP awarded!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      
      {/* Solid Cartoon Card Container with bold borders & chunky drop shadow */}
      <div className="bg-[#0A2E1E] border-[4px] border-[#03140C] rounded-[2rem] p-6 sm:p-8 max-w-md w-full shadow-[8px_8px_0px_#020C07] relative space-y-5 animate-in zoom-in-95 duration-200 text-[#F0FDF4] my-auto">
        
        {/* Playful Top Mascot Badge */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2">
          <div className="w-20 h-20 bg-[#10B981] border-[3.5px] border-[#03140C] rounded-full shadow-[4px_4px_0px_#020C07] flex items-center justify-center text-3xl select-none animate-bounce">
            {authMode === 'signin' ? '🦊' : '🚀'}
          </div>
        </div>

        {/* Top Left: Back Button */}
        <button 
          type="button"
          onClick={onClose}
          className="absolute top-4 left-4 px-3 py-1.5 bg-[#020B06] border-2 border-[#03140C] text-emerald-300 hover:text-white hover:bg-[#072418] rounded-xl flex items-center space-x-1 shadow-[2px_2px_0px_#020C07] active:translate-x-0.5 active:translate-y-0.5 transition-all text-xs font-black font-game"
          title="Back to previous screen"
        >
          <ArrowLeft className="w-4 h-4 stroke-[3]" />
          <span>Back</span>
        </button>

        {/* Top Right: Close Button */}
        <button 
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 bg-[#020B06] border-2 border-[#03140C] text-slate-300 hover:text-white hover:bg-red-950 rounded-full flex items-center justify-center shadow-[2px_2px_0px_#020C07] active:translate-x-0.5 active:translate-y-0.5 transition-all"
          aria-label="Close"
          title="Close modal"
        >
          <X className="w-5 h-5 stroke-[3]" />
        </button>

        {/* Cartoon Header Title */}
        <div className="text-center pt-6 space-y-1">
          <div className="inline-flex items-center space-x-1.5 bg-[#FBBF24] text-[#02140D] font-mono font-black text-xs uppercase px-3 py-1 border-2 border-[#03140C] rounded-full shadow-[2px_2px_0px_#020C07] rotate-[-2deg]">
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span>{authMode === 'signin' ? 'OPERATIVE PORTAL' : 'JOIN THE SQUAD'}</span>
          </div>

          <h2 className="text-3xl font-black text-white font-game tracking-wider drop-shadow-sm pt-1">
            {authMode === 'signin' ? 'Welcome Back!' : 'Create Hero!'}
          </h2>
          <p className="text-xs font-bold text-emerald-200">
            {authMode === 'signin' ? 'Sign in to access your vaults & squad!' : 'Create your account in seconds!'}
          </p>
        </div>

        {/* Cartoon Bouncy Tab Switcher */}
        <div className="flex bg-[#03140C] p-1.5 rounded-2xl border-2 border-[#020B06] shadow-inner font-game text-xs gap-1.5">
          <button
            type="button"
            onClick={() => setAuthMode('signin')}
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
            onClick={() => setAuthMode('register')}
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

        {/* ========================================================================= */}
        {/* 1. SIGN IN MODE */}
        {/* ========================================================================= */}
        {authMode === 'signin' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <form onSubmit={handleLogin} className="space-y-3.5 text-left">
              {/* Email / Username */}
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
                    className="w-full bg-[#03140C] border-2 border-[#0E3D28] focus:border-[#10B981] rounded-2xl pl-11 pr-3.5 py-3 text-white text-sm font-bold shadow-inner outline-none transition-all placeholder:text-emerald-700"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="block text-xs font-black uppercase text-emerald-200 font-game">
                  Password
                </label>
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
                    className="w-full bg-[#03140C] border-2 border-[#0E3D28] focus:border-[#10B981] rounded-2xl pl-11 pr-11 py-3 text-white text-sm font-bold shadow-inner outline-none transition-all placeholder:text-emerald-700"
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

              {/* Cartoon 3D Action Button */}
              <button
                type="submit"
                className="w-full bg-[#10B981] text-[#02140D] font-black py-3.5 rounded-2xl border-[3px] border-[#03140C] shadow-[4px_4px_0px_#020C07] hover:bg-[#34D399] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all text-sm uppercase tracking-wider flex items-center justify-center space-x-2 font-game mt-2"
              >
                <span>LET'S GO! (SIGN IN)</span>
                <ArrowRight className="w-5 h-5 stroke-[3]" />
              </button>

              <div className="text-center pt-2 text-xs font-bold text-slate-300">
                New to VAULT?{' '}
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className="text-[#FBBF24] font-black hover:underline"
                >
                  Create an account! 🎉
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. REGISTER MODE (ONLY: User Name, Email, Password) */}
        {/* ========================================================================= */}
        {authMode === 'register' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <form onSubmit={handleRegister} className="space-y-3.5 text-left">
              
              {/* 1. User Name */}
              <div className="space-y-1">
                <label className="block text-xs font-black uppercase text-emerald-200 font-game">
                  User Name
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
                    placeholder="Pick your hero name"
                    className="w-full bg-[#03140C] border-2 border-[#0E3D28] focus:border-[#10B981] rounded-2xl pl-11 pr-3.5 py-3 text-white text-sm font-bold shadow-inner outline-none transition-all placeholder:text-emerald-700"
                  />
                </div>
              </div>

              {/* 2. Email */}
              <div className="space-y-1">
                <label className="block text-xs font-black uppercase text-emerald-200 font-game">
                  Email
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
                    className="w-full bg-[#03140C] border-2 border-[#0E3D28] focus:border-[#10B981] rounded-2xl pl-11 pr-3.5 py-3 text-white text-sm font-bold shadow-inner outline-none transition-all placeholder:text-emerald-700"
                  />
                </div>
              </div>

              {/* 3. Password */}
              <div className="space-y-1">
                <label className="block text-xs font-black uppercase text-emerald-200 font-game">
                  Password
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
                    placeholder="Create secret password"
                    className="w-full bg-[#03140C] border-2 border-[#0E3D28] focus:border-[#10B981] rounded-2xl pl-11 pr-11 py-3 text-white text-sm font-bold shadow-inner outline-none transition-all placeholder:text-emerald-700"
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

              {/* Cartoon 3D Action Button */}
              <button
                type="submit"
                className="w-full bg-[#FBBF24] text-[#02140D] font-black py-3.5 rounded-2xl border-[3px] border-[#03140C] shadow-[4px_4px_0px_#020C07] hover:bg-[#F59E0B] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all text-sm uppercase tracking-wider flex items-center justify-center space-x-2 font-game mt-2"
              >
                <Sparkles className="w-5 h-5 fill-current" />
                <span>REGISTER HERO!</span>
              </button>

              <div className="text-center pt-2 text-xs font-bold text-slate-300">
                Already have an account?{' '}
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

      </div>
    </div>
  );
}
