export function LeafMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      aria-hidden="true"
      fill="none"
    >
      <path
        d="M6 22c8-1 14-7 18-16 1 9-2 18-10 22-4 2-8 0-8-6Z"
        className="fill-primary"
      />
      <path
        d="M12 20c4-3 7-8 8-14"
        className="stroke-primary-foreground"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
