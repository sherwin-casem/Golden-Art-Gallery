interface LogoIconProps {
  className?: string;
  size?: number;
}

export function LogoIcon({ className = '', size = 40 }: LogoIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 40 40"
      fill="none"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="logoGold" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#D4AF37" />
          <stop offset="1" stopColor="#C9AE5D" />
        </linearGradient>
        <linearGradient id="logoShine" x1="0" y1="0" x2="0" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F7E7CE" stopOpacity="0.3" />
          <stop offset="1" stopColor="#D4AF37" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="36" height="36" rx="3" fill="#0A0A0A" stroke="url(#logoGold)" strokeWidth="1.5" />
      <rect x="5" y="5" width="30" height="30" rx="1.5" fill="none" stroke="url(#logoGold)" strokeWidth="0.75" opacity="0.5" />
      <path d="M5 5h3v1.5H6.5V8H5V5z" fill="url(#logoGold)" />
      <path d="M35 5h-3v1.5h1.5V8H35V5z" fill="url(#logoGold)" />
      <path d="M5 35h3v-1.5H6.5V32H5v3z" fill="url(#logoGold)" />
      <path d="M35 35h-3v-1.5h1.5V32H35v3z" fill="url(#logoGold)" />
      <rect x="8" y="8" width="24" height="24" rx="1" fill="#141414" />
      <rect x="8" y="8" width="24" height="24" rx="1" fill="url(#logoShine)" />
      <circle cx="17" cy="17" r="3.5" fill="url(#logoGold)" opacity="0.35" />
      <rect x="19" y="14" width="5" height="5" rx="0.5" fill="url(#logoGold)" opacity="0.55" transform="rotate(12 21.5 16.5)" />
      <path d="M14 22l4-2.5 4 2.5v3l-4 2.5-4-2.5v-3z" fill="url(#logoGold)" opacity="0.85" />
      <circle cx="29" cy="11" r="4" fill="#0A0A0A" stroke="url(#logoGold)" strokeWidth="1" />
      <path d="M29 9l1.2 1.2 2-2" stroke="url(#logoGold)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}
