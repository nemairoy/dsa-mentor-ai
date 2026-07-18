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
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-2xl bg-slate-950 shadow-[0_18px_45px_rgba(13,148,136,0.24)] ring-1 ring-white/15",
        size === "sm" ? "h-9 w-9 rounded-xl" : "h-12 w-12",
        className,
      )}
      aria-hidden={true}
    >
      <div className={cn("absolute inset-0 rounded-2xl bg-[linear-gradient(135deg,rgba(20,184,166,0.95),rgba(37,99,235,0.9))]", size === "sm" && "rounded-xl")} />
      <div className={cn("absolute bg-slate-950/92", size === "sm" ? "inset-[2px] rounded-[10px]" : "inset-[3px] rounded-[14px]")} />
      <div className="relative flex flex-col items-center leading-none">
        <span className={cn("font-black tracking-normal text-white", size === "sm" ? "text-[11px]" : "text-[15px]")}>DSA</span>
        <span className={cn("mt-0.5 rounded-full bg-gradient-to-r from-emerald-300 to-cyan-300", size === "sm" ? "h-0.5 w-5" : "h-1 w-7")} />
      </div>
    </div>
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
