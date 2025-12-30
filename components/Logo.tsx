import React from 'react';

export const Logo: React.FC<{ size?: number, className?: string }> = ({ size = 40, className = "" }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00f0ff" />
          <stop offset="100%" stopColor="#bd00ff" />
        </linearGradient>
        <filter id="glowFilter">
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Stethoscope Arms */}
      <path 
        d="M20,70 Q20,90 50,90 Q80,90 80,70 V50" 
        stroke="url(#logoGradient)" 
        strokeWidth="4" 
        strokeLinecap="round"
        fill="none"
        filter="url(#glowFilter)"
      />
      <circle cx="20" cy="70" r="5" fill="#00f0ff" filter="url(#glowFilter)" />

      {/* Brain Lobes - Left & Right */}
      <path 
        d="M30,50 Q30,20 50,20 Q70,20 70,50 Q70,60 50,60 Q30,60 30,50 Z" 
        stroke="#e0e0e0" 
        strokeWidth="2" 
        fill="rgba(0, 240, 255, 0.1)"
        className="animate-[pulse_3s_ease-in-out_infinite]"
      />

      {/* Circuit Lines inside Brain */}
      <path d="M40,35 L45,40 L40,45" stroke="#00f0ff" strokeWidth="1" opacity="0.7" />
      <path d="M60,35 L55,40 L60,45" stroke="#bd00ff" strokeWidth="1" opacity="0.7" />
      
      {/* Central AI Chip */}
      <rect 
        x="42" 
        y="32" 
        width="16" 
        height="16" 
        rx="2" 
        fill="#1a1a1a" 
        stroke="url(#logoGradient)" 
        strokeWidth="1.5"
      />
      {/* Chip Text AI */}
      <text x="50" y="44" fontFamily="sans-serif" fontSize="8" fill="white" textAnchor="middle" fontWeight="bold">AI</text>

      {/* Data Flow Particles */}
      <circle cx="35" cy="50" r="1.5" fill="#00ff9d" className="animate-[ping_2s_linear_infinite]" />
      <circle cx="65" cy="50" r="1.5" fill="#00ff9d" className="animate-[ping_2s_linear_infinite_1s]" />

    </svg>
  );
};
