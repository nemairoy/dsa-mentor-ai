import { cn } from "@/lib/utils";

type BrandLogoProps = {
  size?: "sm" | "md";
  className?: string;
};

type BrandLockupProps = BrandLogoProps & {
  subtitle?: string;
  compact?: boolean;
};

export function BrandLogo({ size = "md", className }: BrandLogoProps) {
  return (
    <svg
      viewBox="0 0 128 128"
      className={cn(
        "shrink-0 rounded-2xl shadow-[0_12px_30px_rgba(2,6,23,0.18)]",
        size === "sm" ? "h-9 w-9 rounded-xl" : "h-12 w-12",
        className,
      )}
      role="img"
      aria-label="DSA Mentor AI"
    >
      <rect width="128" height="128" rx="30" fill="#fff" />
      <rect x="5" y="5" width="118" height="118" rx="25" fill="none" stroke="#09090b" strokeWidth="10" />
      <path d="M49 32 25 64l24 32M79 32l24 32-24 32" fill="none" stroke="#09090b" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M64 39v50" fill="none" stroke="#09090b" strokeWidth="9" strokeLinecap="round" />
      <circle cx="64" cy="31" r="9" fill="#09090b" />
      <circle cx="64" cy="64" r="9" fill="#fff" stroke="#09090b" strokeWidth="7" />
      <circle cx="64" cy="97" r="9" fill="#09090b" />
    </svg>
  );
}

export function BrandLockup({ size = "md", subtitle = "Learn / Practice / Visualize / Improve", compact = false, className }: BrandLockupProps) {
  return (
    <div className={cn("flex min-w-0 items-center gap-3", className)}>
      <BrandLogo size={size} />
      <div className="min-w-0">
        <p className={cn("truncate font-bold tracking-normal text-foreground", compact ? "text-sm" : "text-sm sm:text-base")}>DSA Mentor AI</p>
        {subtitle ? <p className={cn("truncate font-medium text-muted-foreground", compact ? "text-[10px]" : "text-[11px] sm:text-xs")}>{subtitle}</p> : null}
      </div>
    </div>
  );
}
