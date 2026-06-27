import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import {
  Brain, Mail, Lock, User, ArrowRight, Sun, Moon,
  Sparkles, Shield, Database, ChevronLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// ── Left side neural graphic helper ──────────────────────────────────────────
function LeftPanelGraphic({ isDark }) {
  const nodes = [
    { x: 15, y: 20 }, { x: 45, y: 15 }, { x: 75, y: 25 },
    { x: 80, y: 55 }, { x: 50, y: 75 }, { x: 20, y: 65 },
    { x: 48, y: 45 }
  ];
  const connections = [
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0],
    [0, 6], [1, 6], [2, 6], [3, 6], [4, 6], [5, 6]
  ];

  const lineColor = isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.08)';
  const nodeBg    = isDark ? 'rgba(139,92,246,0.3)'  : 'rgba(139,92,246,0.15)';

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      {/* Orb glows */}
      <div className="absolute top-[10%] left-[10%] w-[350px] h-[350px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', willChange: 'transform' }} />
      <div className="absolute bottom-[10%] right-[10%] w-[350px] h-[350px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)', willChange: 'transform' }} />

      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">
        {connections.map(([a, b], i) => (
          <line key={i} x1={`${nodes[a].x}%`} y1={`${nodes[a].y}%`} x2={`${nodes[b].x}%`} y2={`${nodes[b].y}%`}
            stroke={lineColor} strokeWidth="0.25" />
        ))}
        {nodes.map((n, i) => (
          <circle key={i} cx={`${n.x}%`} cy={`${n.y}%`} r="1"
            fill={i === 6 ? '#6366f1' : nodeBg}
            style={i === 6 ? { filter: 'drop-shadow(0 0 8px rgba(99,102,241,0.8))' } : undefined} />
        ))}
      </svg>
    </div>
  );
}

export default function Register() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const { register, loginWithGoogle } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGoogleSignIn = async () => {
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (err) {
      setError(err.message || 'Google Sign In failed.');
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsSubmitting(true);
    try {
      await register(fullName, email, password);
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (err) {
      setError(err.message || 'Registration failed. Check your input parameters.');
      setIsSubmitting(false);
    }
  };

  // Theme-sensitive styles
  const bgLeft      = isDark ? '#080811' : '#f4f6ff';
  const bgRight     = isDark ? '#0b0b16' : '#ffffff';
  const borderCol   = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(99,102,241,0.12)';
  const inputBg     = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(99,102,241,0.03)';
  const inputBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(99,102,241,0.12)';
  const labelColor  = isDark ? '#94a3b8' : '#475569';
  const cardBg      = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.8)';
  const cardBorder  = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(99,102,241,0.08)';
  const cardShadow  = isDark 
    ? '0 20px 50px rgba(0,0,0,0.3)' 
    : '0 20px 50px rgba(99,102,241,0.05), 0 2px 8px rgba(0,0,0,0.02)';

  return (
    <div className="min-h-screen flex font-sans transition-colors duration-300 overflow-hidden"
      style={{ background: bgRight }}>

      {/* Inject styling */}
      <style>{`
        .mv-grad-text {
          background: linear-gradient(135deg, #818cf8, #a78bfa, #10b981);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .mv-input:focus {
          border-color: #6366f1;
          box-shadow: 0 0 14px rgba(99,102,241,0.15);
        }
        .glow-hover:hover {
          box-shadow: 0 0 20px rgba(99,102,241,0.3);
        }
      `}</style>
      
      {/* Left Panel: Animated Illustration */}
      <div className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-between relative overflow-hidden transition-colors duration-300"
        style={{ background: bgLeft, borderRight: `1px solid ${borderCol}` }}>
        
        <LeftPanelGraphic isDark={isDark} />

        {/* Brand header */}
        <div className="flex items-center gap-2.5 z-10 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm text-white"
            style={{ background: 'linear-gradient(135deg, #6366f1, #a78bfa)', boxShadow: '0 0 16px rgba(99,102,241,0.4)' }}>
            M
          </div>
          <span className="font-bold text-base tracking-tight" style={{ color: isDark ? '#fff' : '#0f172a' }}>
            MemoryVerse <span className="text-indigo-400">AI</span>
          </span>
        </div>

        {/* Dynamic center card text */}
        <div className="max-w-md space-y-6 z-10 my-auto">
          <div className="inline-flex p-3 rounded-xl border"
            style={{ background: isDark ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.06)', borderColor: borderCol }}>
            <Sparkles className="w-5 h-5 text-indigo-400" />
          </div>
          <h2 className="text-3xl font-black tracking-tight leading-tight" style={{ color: isDark ? '#fff' : '#0f172a' }}>
            Begin structuring your <span className="mv-grad-text">second brain</span> today.
          </h2>
          <p className="text-xs leading-relaxed font-medium" style={{ color: isDark ? '#64748b' : '#475569' }}>
            Ingest PDFs, notes, and photos, and see them map automatically based on semantic context, events, and people. Free local vector database storage support included.
          </p>

          <div className="flex items-center gap-6 pt-2">
            {[
              { icon: Shield, label: 'Encrypted' },
              { icon: Database, label: 'Local Store' }
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider"
                style={{ color: isDark ? '#475569' : '#64748b' }}>
                <item.icon className="w-3.5 h-3.5 text-indigo-400" />
                {item.label}
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <p className="text-[10px] z-10" style={{ color: isDark ? '#334155' : '#94a3b8' }}>
          © 2026 MemoryVerse AI. All rights reserved.
        </p>
      </div>

      {/* Right Panel: Authentication Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-12 relative overflow-y-auto">
        
        {/* Top Navbar items */}
        <div className="flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2.5 lg:hidden cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm"
              style={{ background: 'linear-gradient(135deg, #6366f1, #a78bfa)' }}>
              M
            </div>
            <span className="font-bold text-base tracking-tight" style={{ color: isDark ? '#fff' : '#0f172a' }}>MemoryVerse</span>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <button onClick={toggleTheme}
              className="p-2 rounded-lg transition-colors hover:bg-indigo-500/10"
              style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Link to="/" className="text-xs font-semibold flex items-center gap-1 transition-colors hover:text-indigo-400"
              style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
              <ChevronLeft className="w-3.5 h-3.5" /> Back
            </Link>
          </div>
        </div>

        {/* Core Auth Card Form */}
        <div className="my-auto max-w-sm w-full mx-auto p-6 sm:p-8 rounded-2xl transition-all duration-300 border"
          style={{ background: cardBg, borderColor: cardBorder, boxShadow: cardShadow, backdropFilter: 'blur(16px)' }}>
          <div className="space-y-2 mb-6">
            <h1 className="text-2xl font-black tracking-tight" style={{ color: isDark ? '#fff' : '#0f172a' }}>Create Account</h1>
            <p className="text-xs" style={{ color: isDark ? '#64748b' : '#64748b' }}>Register below to begin building your personal second brain.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-xs bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 text-xs bg-green-500/10 border border-green-500/20 text-green-500 rounded-xl">
                Account created successfully! Redirecting...
              </div>
            )}

            {/* Full Name Field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: labelColor }}>Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-xs border rounded-xl focus:outline-none transition-all mv-input"
                  style={{ background: inputBg, borderColor: inputBorder, color: isDark ? '#fff' : '#0f172a' }}
                />
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: isDark ? '#475569' : '#94a3b8' }} />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: labelColor }}>Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-xs border rounded-xl focus:outline-none transition-all mv-input"
                  style={{ background: inputBg, borderColor: inputBorder, color: isDark ? '#fff' : '#0f172a' }}
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: isDark ? '#475569' : '#94a3b8' }} />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: labelColor }}>Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-xs border rounded-xl focus:outline-none transition-all mv-input"
                  style={{ background: inputBg, borderColor: inputBorder, color: isDark ? '#fff' : '#0f172a' }}
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: isDark ? '#475569' : '#94a3b8' }} />
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: labelColor }}>Confirm Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-xs border rounded-xl focus:outline-none transition-all mv-input"
                  style={{ background: inputBg, borderColor: inputBorder, color: isDark ? '#fff' : '#0f172a' }}
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: isDark ? '#475569' : '#94a3b8' }} />
              </div>
            </div>

            {/* Agree Terms Checkbox */}
            <div className="flex items-center gap-2 py-1">
              <input
                id="agree"
                type="checkbox"
                required
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="w-3.5 h-3.5 accent-indigo-500 border border-border rounded focus:ring-0 cursor-pointer"
              />
              <label htmlFor="agree" className="text-xs cursor-pointer font-medium select-none"
                style={{ color: isDark ? '#64748b' : '#64748b' }}>
                I agree to the terms and privacy policy
              </label>
            </div>

            {/* Buttons */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed glow-hover"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 14px rgba(99,102,241,0.25)' }}
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>

            {/* Social Logins */}
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t" style={{ borderColor: borderCol }}></div>
              <span className="flex-shrink mx-4 text-[9px] font-bold uppercase" style={{ color: isDark ? '#334155' : '#94a3b8' }}>Or continue with</span>
              <div className="flex-grow border-t" style={{ borderColor: borderCol }}></div>
            </div>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleGoogleSignIn}
              className="w-full py-2.5 font-bold text-xs rounded-xl border transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-500/5"
              style={{ background: inputBg, borderColor: inputBorder, color: isDark ? '#fff' : '#0f172a' }}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path fill="#ea4335" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#fbbc05" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#4285f4" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#34a853" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              Google Workspace
            </button>
          </form>

          {/* Navigation link */}
          <p className="text-xs text-center mt-6" style={{ color: isDark ? '#64748b' : '#64748b' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-indigo-400 hover:underline">
              Sign In
            </Link>
          </p>
        </div>

        {/* Footer info (Mobile view only) */}
        <p className="text-[9px] text-center lg:hidden pt-8" style={{ color: isDark ? '#334155' : '#94a3b8' }}>
          © 2026 MemoryVerse AI. All rights reserved.
        </p>
      </div>

    </div>
  );
}
