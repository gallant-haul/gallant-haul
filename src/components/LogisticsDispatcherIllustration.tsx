import React from 'react';
import { Truck, ShieldCheck, MapPin, Radio, Wifi, Award } from 'lucide-react';

interface LogisticsDispatcherIllustrationProps {
  activeField?: 'email' | 'password' | null;
  portalType?: 'client' | 'driver' | 'admin';
}

export default function LogisticsDispatcherIllustration({
  activeField = null,
  portalType = 'client',
}: LogisticsDispatcherIllustrationProps) {
  const isTypingPassword = activeField === 'password';
  const isTypingEmail = activeField === 'email';
  const isActive = isTypingPassword || isTypingEmail;

  const getPortalBadge = () => {
    switch (portalType) {
      case 'driver':
        return {
          title: 'Dedicated Driver Fleet',
          status: 'Class 1 / CDL-A Network',
          code: 'CORRIDOR-FAST',
        };
      case 'admin':
        return {
          title: 'Master Operations Command',
          status: 'Dispatch & Fleet Control',
          code: 'DISPATCH-OPS',
        };
      default:
        return {
          title: 'Client Freight Terminal',
          status: 'Live Border Tracking Active',
          code: 'PARS / PAPRS',
        };
    }
  };

  const badge = getPortalBadge();

  return (
    <div className="relative w-full h-full min-h-[460px] flex flex-col items-center justify-between p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-teal-950/70 border border-slate-800 text-white overflow-hidden shadow-2xl">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Telemetry Header */}
      <div className="w-full flex items-center justify-between z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-teal-500/20 border border-teal-500/30 text-teal-400 shadow-sm">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-teal-300 font-bold">
              {badge.code}
            </div>
            <div className="text-xs font-bold text-white tracking-tight">{badge.title}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700/60 text-[11px] font-mono text-slate-300">
          <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
          <span>{isActive ? (isTypingPassword ? 'Securing Key...' : 'Verifying ID...') : badge.status}</span>
        </div>
      </div>

      {/* Central SVG Animated Scene: 3D Dispatcher Character + Semi-Truck */}
      <div className="relative w-full max-w-md my-4 flex items-center justify-center z-10">
        <svg
          viewBox="0 0 520 320"
          className="w-full h-auto drop-shadow-2xl"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="truckBody" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0f766e" />
              <stop offset="50%" stopColor="#0d9488" />
              <stop offset="100%" stopColor="#115e59" />
            </linearGradient>

            <linearGradient id="cabGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>

            <linearGradient id="goldGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>

            <linearGradient id="headlightBeam" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#2dd4bf" stopOpacity={isActive ? "0.6" : "0.3"} />
              <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0" />
            </linearGradient>

            <linearGradient id="characterSkin" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fed7aa" />
              <stop offset="100%" stopColor="#fba471" />
            </linearGradient>

            <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Highway Road Base */}
          <rect x="20" y="250" width="480" height="30" rx="6" fill="#1e293b" />
          <line
            x1="30"
            y1="265"
            x2="490"
            y2="265"
            stroke="#fcd34d"
            strokeWidth="3"
            className="anim-road"
          />

          {/* Headlight beam shining on road when typing */}
          <polygon
            points="465,225 515,215 515,268 465,245"
            fill="url(#headlightBeam)"
          />

          {/* Animated Freight Truck Group */}
          <g className="anim-truck">
            {/* Trailer Body */}
            <rect
              x="80"
              y="110"
              width="240"
              height="115"
              rx="8"
              fill="url(#truckBody)"
              stroke="#14b8a6"
              strokeWidth="2"
            />
            {/* Trailer Decorative Stripes & Logo Branding */}
            <path d="M 80 200 L 320 200" stroke="#fcd34d" strokeWidth="4" />
            <path d="M 80 130 L 320 130" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.3" />

            {/* Gallant Crest on Trailer */}
            <circle cx="200" cy="155" r="24" fill="#0f172a" stroke="url(#goldGradient)" strokeWidth="2" />
            <path
              d="M 192 158 L 200 144 L 208 158 Z"
              fill="url(#goldGradient)"
            />
            <text
              x="200"
              y="190"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="9"
              fontFamily="Plus Jakarta Sans, sans-serif"
              fontWeight="bold"
              letterSpacing="1"
            >
              GALLANT LINE HAUL
            </text>

            {/* Truck Tractor / Cab */}
            <path
              d="M 320 140 L 400 140 L 440 175 L 465 185 L 465 235 L 320 235 Z"
              fill="url(#cabGradient)"
              stroke="#475569"
              strokeWidth="2"
            />

            {/* Cab Windshield */}
            <polygon
              points="400,146 432,175 390,175"
              fill="#38bdf8"
              fillOpacity="0.6"
            />

            {/* Front Headlight LED */}
            <circle
              cx="460"
              cy="225"
              r={isActive ? "6" : "4"}
              fill="#2dd4bf"
              filter={isActive ? "url(#glowEffect)" : undefined}
            />

            {/* Chrome Exhaust Stack */}
            <rect x="330" y="85" width="8" height="55" rx="3" fill="#cbd5e1" stroke="#94a3b8" />
            {/* Animated Smoke Puffs */}
            <circle cx="334" cy="70" r="4" fill="#94a3b8" fillOpacity="0.4" className="anim-float" />
            <circle cx="332" cy="55" r="6" fill="#94a3b8" fillOpacity="0.2" className="anim-float" style={{ animationDelay: '0.4s' }} />

            {/* Heavy-Duty Rolling Wheels */}
            {/* Trailer Wheels */}
            <g transform="translate(130, 245)">
              <circle cx="0" cy="0" r="18" fill="#0f172a" stroke="#64748b" strokeWidth="4" />
              <circle cx="0" cy="0" r="8" fill="#cbd5e1" />
              <g className="anim-spin-wheel">
                <line x1="-12" y1="0" x2="12" y2="0" stroke="#334155" strokeWidth="2" />
                <line x1="0" y1="-12" x2="0" y2="12" stroke="#334155" strokeWidth="2" />
              </g>
            </g>
            <g transform="translate(180, 245)">
              <circle cx="0" cy="0" r="18" fill="#0f172a" stroke="#64748b" strokeWidth="4" />
              <circle cx="0" cy="0" r="8" fill="#cbd5e1" />
              <g className="anim-spin-wheel">
                <line x1="-12" y1="0" x2="12" y2="0" stroke="#334155" strokeWidth="2" />
                <line x1="0" y1="-12" x2="0" y2="12" stroke="#334155" strokeWidth="2" />
              </g>
            </g>

            {/* Tractor Cab Wheels */}
            <g transform="translate(365, 245)">
              <circle cx="0" cy="0" r="18" fill="#0f172a" stroke="#64748b" strokeWidth="4" />
              <circle cx="0" cy="0" r="8" fill="#cbd5e1" />
              <g className="anim-spin-wheel">
                <line x1="-12" y1="0" x2="12" y2="0" stroke="#334155" strokeWidth="2" />
                <line x1="0" y1="-12" x2="0" y2="12" stroke="#334155" strokeWidth="2" />
              </g>
            </g>
            <g transform="translate(435, 245)">
              <circle cx="0" cy="0" r="18" fill="#0f172a" stroke="#64748b" strokeWidth="4" />
              <circle cx="0" cy="0" r="8" fill="#cbd5e1" />
              <g className="anim-spin-wheel">
                <line x1="-12" y1="0" x2="12" y2="0" stroke="#334155" strokeWidth="2" />
                <line x1="0" y1="-12" x2="0" y2="12" stroke="#334155" strokeWidth="2" />
              </g>
            </g>
          </g>

          {/* 3D Logistics Dispatcher Character (Holding Clipboard / Tablet) */}
          <g transform={`translate(28, 90) ${isActive ? 'scale(1.03)' : ''}`} className="transition-transform duration-300">
            {/* Shadow beneath dispatcher */}
            <ellipse cx="40" cy="165" rx="32" ry="7" fill="#020617" fillOpacity="0.8" />

            {/* Body / Corporate Vest */}
            <path
              d="M 22 95 C 22 75, 58 75, 58 95 L 62 145 C 62 155, 18 155, 18 145 Z"
              fill="#0d9488"
              stroke="#115e59"
              strokeWidth="2"
            />
            {/* Safety High-Vis Stripes */}
            <line x1="28" y1="100" x2="28" y2="140" stroke="#fcd34d" strokeWidth="3" />
            <line x1="52" y1="100" x2="52" y2="140" stroke="#fcd34d" strokeWidth="3" />
            <line x1="20" y1="120" x2="60" y2="120" stroke="#fcd34d" strokeWidth="3" />

            {/* Neck */}
            <rect x="34" y="66" width="12" height="12" rx="2" fill="url(#characterSkin)" />

            {/* Head */}
            <circle
              cx="40"
              cy="52"
              r="18"
              fill="url(#characterSkin)"
              stroke="#ea580c"
              strokeWidth="1.5"
            />

            {/* Stylized Hair */}
            <path
              d="M 24 48 C 24 30, 56 30, 56 48 C 50 38, 30 38, 24 48 Z"
              fill="#1e293b"
            />

            {/* Face details - Reacts to activeField */}
            {isTypingPassword ? (
              /* Playful "Eyes Focused / Checking Keys" expression */
              <g>
                <circle cx="36" cy="51" r="2" fill="#0f172a" />
                <circle cx="46" cy="51" r="2" fill="#0f172a" />
                <path d="M 38 59 Q 41 62 44 59" stroke="#0f172a" strokeWidth="1.5" fill="none" />
              </g>
            ) : (
              /* Friendly, professional smile */
              <g>
                <circle cx="36" cy="51" r="2.5" fill="#0f172a" />
                <circle cx="46" cy="51" r="2.5" fill="#0f172a" />
                <path d="M 37 58 Q 41 63 45 58" stroke="#0f172a" strokeWidth="1.5" fill="none" />
              </g>
            )}

            {/* Operations Headset */}
            <path
              d="M 21 49 C 21 30, 59 30, 59 49"
              stroke="#0f172a"
              strokeWidth="3"
              fill="none"
            />
            {/* Headset earpiece */}
            <rect x="19" y="47" width="5" height="10" rx="2" fill="#38bdf8" />
            {/* Microphone Boom */}
            <path d="M 21 54 L 33 60" stroke="#0f172a" strokeWidth="2" fill="none" />
            <circle cx="33" cy="60" r="2" fill="#2dd4bf" filter="url(#glowEffect)" />

            {/* Arms holding digital manifest tablet */}
            <path d="M 22 105 L 12 120 L 25 130" stroke="#0f766e" strokeWidth="6" strokeLinecap="round" />
            <path d="M 58 105 L 68 120 L 55 130" stroke="#0f766e" strokeWidth="6" strokeLinecap="round" />

            {/* Digital Manifest Tablet */}
            <rect
              x="22"
              y="115"
              width="36"
              height="26"
              rx="4"
              fill="#0f172a"
              stroke="#38bdf8"
              strokeWidth="1.5"
            />
            <rect x="25" y="118" width="30" height="20" rx="2" fill="#0284c7" fillOpacity="0.2" />
            {/* Glowing lines on tablet */}
            <line x1="28" y1="123" x2="52" y2="123" stroke="#38bdf8" strokeWidth="1.5" />
            <line x1="28" y1="128" x2="48" y2="128" stroke="#2dd4bf" strokeWidth="1.5" />
            <line x1="28" y1="133" x2="42" y2="133" stroke="#fcd34d" strokeWidth="1.5" />
          </g>

          {/* Floating Live Telemetry Cards */}
          <g className="anim-float" style={{ animationDelay: '0.2s' }}>
            <rect x="280" y="35" width="135" height="42" rx="10" fill="#0f172a" fillOpacity="0.9" stroke="#0d9488" strokeWidth="1.5" filter="url(#glowEffect)" />
            <circle cx="295" cy="56" r="4" fill="#2dd4bf" />
            <text x="306" y="52" fill="#f8fafc" fontSize="10" fontWeight="bold" fontFamily="Plus Jakarta Sans, sans-serif">
              FAST Lane Cleared
            </text>
            <text x="306" y="65" fill="#94a3b8" fontSize="8" fontFamily="Plus Jakarta Sans, sans-serif">
              Ambassador Bridge & Peace
            </text>
          </g>

          <g className="anim-float" style={{ animationDelay: '0.8s' }}>
            <rect x="40" y="20" width="125" height="38" rx="10" fill="#0f172a" fillOpacity="0.9" stroke="#38bdf8" strokeWidth="1.5" />
            <circle cx="55" cy="39" r="4" fill="#38bdf8" />
            <text x="66" y="47" fill="#94a3b8" fontSize="8" fontFamily="Plus Jakarta Sans, sans-serif">
              GPS Telemetry 24/7
            </text>
          </g>
        </svg>
      </div>

      {/* Bottom Live Feature Pills */}
      <div className="w-full grid grid-cols-3 gap-2 pt-3 border-t border-slate-800/80 text-center z-10">
        <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-[10px] text-teal-400 font-bold uppercase tracking-wider">Fast Lane</div>
          <div className="text-xs font-bold text-white mt-0.5">Customs Verified</div>
        </div>
        <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-[10px] text-teal-400 font-bold uppercase tracking-wider">Satellite GPS</div>
          <div className="text-xs font-bold text-white mt-0.5">Real-Time Sync</div>
        </div>
        <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-[10px] text-teal-400 font-bold uppercase tracking-wider">24/7 Dispatch</div>
          <div className="text-xs font-bold text-white mt-0.5">Dedicated Desk</div>
        </div>
      </div>
    </div>
  );
}
