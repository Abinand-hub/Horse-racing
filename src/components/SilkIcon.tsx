import React from 'react';

interface SilkIconProps {
  color?: string;
  number?: number | string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const SilkIcon: React.FC<SilkIconProps> = ({
  color = '#ef4444',
  number,
  className = '',
  size = 'md',
}) => {
  // Preset patterns based on horse number or color string
  const num = typeof number === 'number' ? number : parseInt(String(number)) || 1;
  const patternType = (num % 6);

  const sizeDimensions = {
    sm: { width: 24, height: 24 },
    md: { width: 34, height: 34 },
    lg: { width: 44, height: 44 },
    xl: { width: 56, height: 56 },
  }[size];

  // Derive secondary contrasting color
  const secondaryColors = [
    '#ffffff',
    '#fbbf24',
    '#000000',
    '#38bdf8',
    '#a855f7',
    '#4ade80',
  ];
  const secColor = secondaryColors[(num * 2) % secondaryColors.length];

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 drop-shadow-md select-none ${className}`}
      style={{ width: sizeDimensions.width, height: sizeDimensions.height }}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          {/* Diagonal Stripes Pattern */}
          <pattern id={`stripes-${num}`} width="20" height="20" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="20" stroke={secColor} strokeWidth="8" />
          </pattern>
          {/* Chevrons Pattern */}
          <pattern id={`chevrons-${num}`} width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M0 10 L10 0 L20 10 L20 20 L10 10 L0 20 Z" fill={secColor} />
          </pattern>
          {/* Subtle gradient shine */}
          <linearGradient id={`shine-${num}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.25" />
          </linearGradient>
        </defs>

        {/* Sleeves */}
        <path
          d="M14 36 L2 56 L12 62 L26 44 Z"
          fill={secColor}
          stroke="#1e293b"
          strokeWidth="1.5"
        />
        <path
          d="M86 36 L98 56 L88 62 L74 44 Z"
          fill={secColor}
          stroke="#1e293b"
          strokeWidth="1.5"
        />

        {/* Main Jersey Body */}
        <path
          d="M24 36 L36 28 L64 28 L76 36 L72 88 L28 88 Z"
          fill={color}
          stroke="#1e293b"
          strokeWidth="2"
        />

        {/* Dynamic Pattern Overlay */}
        {patternType === 1 && (
          // Diagonal Sash
          <path
            d="M36 28 L76 88 L64 88 L24 36 Z"
            fill={secColor}
            clipPath="url(#body-clip)"
          />
        )}
        {patternType === 2 && (
          // Hoops (horizontal stripes)
          <>
            <rect x="26" y="44" width="48" height="10" fill={secColor} />
            <rect x="26" y="66" width="48" height="10" fill={secColor} />
          </>
        )}
        {patternType === 3 && (
          // Vertical Halves
          <rect x="50" y="28" width="26" height="60" fill={secColor} />
        )}
        {patternType === 4 && (
          // V-Neck Chevron
          <path
            d="M26 36 L50 62 L74 36 L66 32 L50 50 L34 32 Z"
            fill={secColor}
          />
        )}
        {patternType === 5 && (
          // Quarters
          <>
            <rect x="24" y="32" width="26" height="28" fill={secColor} />
            <rect x="50" y="60" width="26" height="28" fill={secColor} />
          </>
        )}

        {/* White Collar */}
        <path
          d="M36 28 C42 34 58 34 64 28 L58 22 C52 25 48 25 42 22 Z"
          fill="#ffffff"
          stroke="#cbd5e1"
          strokeWidth="1"
        />

        {/* Jockey Cap */}
        <path
          d="M38 18 C38 10 62 10 62 18 C66 19 68 22 50 22 C32 22 34 19 38 18 Z"
          fill={color}
          stroke="#0f172a"
          strokeWidth="1.5"
        />
        {/* Cap Visor */}
        <path
          d="M44 21 C50 21 68 22 72 25 C64 27 50 26 44 21 Z"
          fill="#1e293b"
        />

        {/* Glossy Overlay */}
        <path
          d="M24 36 L36 28 L64 28 L76 36 L72 88 L28 88 Z"
          fill={`url(#shine-${num})`}
        />
      </svg>

      {/* Number Badge Pill if requested */}
      {number !== undefined && (
        <span
          className="absolute -bottom-1 -right-1 bg-slate-950 text-amber-300 font-extrabold rounded-full flex items-center justify-center border border-amber-500/50 shadow-sm"
          style={{
            fontSize: size === 'sm' ? '8px' : size === 'md' ? '10px' : '12px',
            minWidth: size === 'sm' ? '14px' : '18px',
            height: size === 'sm' ? '14px' : '18px',
            padding: '0 2px',
          }}
        >
          {number}
        </span>
      )}
    </div>
  );
};
