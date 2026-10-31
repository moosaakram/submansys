'use client';

import React from 'react';
import Image from 'next/image';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showText?: boolean;
  theme?: 'dark' | 'light';
  subtext?: string;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  theme = 'light',
  subtext = 'Subscription Platform',
  className = '',
}) => {
  const sizeMap = {
    sm: { img: 26, box: 'w-7 h-7', text: 'text-sm', badge: 'text-[8px] px-1' },
    md: { img: 36, box: 'w-9 h-9', text: 'text-base', badge: 'text-[9px] px-1.5 py-0.2' },
    lg: { img: 48, box: 'w-12 h-12', text: 'text-xl', badge: 'text-[10px] px-2 py-0.5' },
    xl: { img: 64, box: 'w-16 h-16', text: 'text-2xl', badge: 'text-[11px] px-2.5 py-0.5' },
    '2xl': { img: 84, box: 'w-22 h-22', text: 'text-3xl', badge: 'text-xs px-3 py-0.5' },
  };

  const currentSize = sizeMap[size];
  const isLightText = theme === 'light';

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* Standalone Transparent SM Monogram - No Box, No Golden Outline, No Background */}
      <div className={`${currentSize.box} relative shrink-0 flex items-center justify-center`}>
        <Image
          src="/logo.png"
          alt="SubMan Logo"
          width={currentSize.img}
          height={currentSize.img}
          className="w-full h-full object-contain filter drop-shadow-md"
          priority
        />
      </div>

      {/* Brand Wordmark & Pill */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-2 leading-tight">
            <span
              className={`font-[family-name:var(--font-cinzel)] font-bold ${currentSize.text} tracking-tight ${
                isLightText ? 'text-white' : 'text-slate-900'
              }`}
            >
              SubMan
            </span>
            <span
              className={`rounded-full bg-[#1c2530] text-[#c9ab70] font-bold uppercase tracking-wider border border-[#c9ab70]/30 ${currentSize.badge}`}
            >
              Pro
            </span>
          </div>
          {subtext && (
            <p
              className={`text-[10px] font-medium leading-tight mt-0.5 ${
                isLightText ? 'text-white/60' : 'text-slate-500'
              }`}
            >
              {subtext}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Logo;
