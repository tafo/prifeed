export function Logo({ className = 'h-7 w-7' }: { className?: string }): React.JSX.Element {
  return (
    <svg viewBox="0 0 1024 1024" className={className} aria-hidden="true">
      <rect width="1024" height="1024" rx="220" ry="220" fill="#1f242b" />
      <circle cx="332" cy="242" r="56" fill="#61afef" />
      <circle cx="512" cy="242" r="56" fill="#61afef" />
      <circle cx="692" cy="242" r="56" fill="#61afef" />
      <circle cx="512" cy="422" r="56" fill="#61afef" />
      <circle cx="512" cy="602" r="56" fill="#61afef" />
      <circle cx="512" cy="782" r="56" fill="#61afef" />
    </svg>
  )
}
