import React, { useEffect, useState } from 'react';


const SplashScreen = ({ onDone }) => {
  useEffect(() => {
    const timer = setTimeout(onDone, 2800);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div style={{ background: 'linear-gradient(160deg, #0d2137 0%, #0a3328 50%, #0f4d3a 100%)' }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden transition-opacity duration-500">

      {/* Pulse rings */}
      <div className="absolute w-80 h-80 rounded-full border border-emerald-400/10 animate-ping" style={{ animationDuration: '3s' }} />
      <div className="absolute w-52 h-52 rounded-full border border-emerald-400/15 animate-ping" style={{ animationDuration: '2.4s', animationDelay: '0.6s' }} />

      {/* Logo */}
      <div className="w-24 h-24 rounded-3xl bg-emerald-400/15 border border-emerald-400/30 flex items-center justify-center mb-6">
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
    <rect x="8" y="13" width="22" height="4.5" rx="2.25" fill="#34d399"/>
    <rect x="8" y="22" width="16" height="4.5" rx="2.25" fill="rgba(52,211,153,0.6)"/>
    <rect x="8" y="31" width="19" height="4.5" rx="2.25" fill="rgba(52,211,153,0.35)"/>
    <circle cx="36" cy="33" r="9" fill="#0a3328" stroke="#34d399" stroke-width="2"/>
    <path d="M32.5 33l2.2 2.2 3.8-3.8" stroke="#34d399" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
</div>

      {/* Text */}
      <div className="animate-[fadeInUp_0.5s_ease_0.65s_both] text-center">
        <p className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold text-white tracking-tight mb-1.5">TabTrack</p>
        <p className="font-['Inter'] text-[11px] font-bold tracking-[3px] uppercase text-emerald-400/80">Track. Manage. Grow.</p>
      </div>

      {/* Progress bar */}
      <div className="mt-14 w-40">
        <div className="h-0.5 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-300 rounded-full animate-[progress_1.8s_cubic-bezier(0.4,0,0.2,1)_1.3s_both]" />
        </div>
        <p className="mt-3 text-center font-['Inter'] text-[11px] text-white/30 tracking-wide">Loading your workspace...</p>
      </div>
    </div>
  );
};

export default SplashScreen;