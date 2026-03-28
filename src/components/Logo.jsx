export function LogoMark({ size = 32, className = '' }) {
  return (
    <svg viewBox="0 0 512 512" width={size} height={size} className={className}>
      <defs>
        <linearGradient id={`logo-bg-${size}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2BA8D4"/>
          <stop offset="100%" stopColor="#1E7DA0"/>
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="108" fill={`url(#logo-bg-${size})`}/>
      <rect x="120" y="148" width="56" height="248" rx="28" fill="white" opacity="0.95"/>
      <rect x="228" y="208" width="56" height="188" rx="28" fill="white" opacity="0.65"/>
      <rect x="336" y="268" width="56" height="128" rx="28" fill="white" opacity="0.35"/>
      <path d="M148 128 L148 100 L128 120 M148 100 L168 120"
            stroke="white" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.95"/>
    </svg>
  )
}

export function LogoFull({ size = 32, className = '' }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark size={size} />
      <span className="font-bold text-slate-900 dark:text-white" style={{ fontSize: size * 0.5 }}>
        Prioritise<span className="text-brand-400">It</span>
      </span>
    </div>
  )
}
