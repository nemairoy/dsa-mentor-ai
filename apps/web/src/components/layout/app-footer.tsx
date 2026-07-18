import Link from "next/link";

import { BrandLockup } from "@/components/brand/brand-logo";

export function AppFooter() {
  return (
    <footer className="mt-10 border-t border-border pt-6 text-sm text-muted-foreground">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <BrandLockup size="sm" compact />
        <div className="flex flex-wrap items-center gap-4">
          <a href="mailto:iamnemairoy@gmail.com" className="hover:text-foreground">Contact</a>
          <span>iamnemairoy@gmail.com</span>
          <a
            href="https://nemairoy.great-site.net/?i=1"
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-8 items-center rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-primary hover:bg-accent hover:text-accent-foreground"
          >
            Developer portfolio
          </a>
          <span>v1.0.0</span>
          <span>Copyright 2026</span>
          <Link href="/settings" className="hover:text-foreground">Settings</Link>
        </div>
      </div>
    </footer>
  );
}
