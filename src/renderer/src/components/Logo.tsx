export function Logo({ className = 'h-7 w-7' }: { className?: string }): React.JSX.Element {
  return (
    <svg viewBox="0 0 1024 1024" className={className} aria-hidden="true">
      <rect width="1024" height="1024" rx="220" ry="220" fill="var(--color-elevated)" />
      <circle cx="332" cy="242" r="56" fill="var(--color-accent)" />
      <circle cx="512" cy="242" r="56" fill="var(--color-accent)" />
      <circle cx="692" cy="242" r="56" fill="var(--color-accent)" />
      <circle cx="512" cy="422" r="56" fill="var(--color-accent)" />
      <circle cx="512" cy="602" r="56" fill="var(--color-accent)" />
      <circle cx="512" cy="782" r="56" fill="var(--color-accent)" />
    </svg>
  )
}
