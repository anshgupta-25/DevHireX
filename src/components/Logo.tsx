export function LogoIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M50 15 L75 40 L50 65 L25 40 Z" fill="currentColor" fillOpacity="0.5" />
      <path d="M50 35 L75 60 L50 85 L25 60 Z" fill="currentColor" />
    </svg>
  );
}
