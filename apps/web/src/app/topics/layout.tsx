import Link from "next/link";

import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { BrandLockup } from "@/components/brand/brand-logo";

export default function TopicsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/92 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" aria-label="DSA Mentor AI home"><BrandLockup size="sm" compact /></Link>
          <nav className="flex items-center gap-1 sm:gap-2" aria-label="Public lessons navigation">
            <Link href="/topics" className="rounded-lg px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground sm:text-sm">All topics</Link>
            <GoogleSignInButton className="h-9 rounded-lg bg-foreground px-3 text-xs font-bold text-background hover:opacity-90 sm:px-4 sm:text-sm" />
          </nav>
        </div>
      </header>
      {children}
      <footer className="mt-16 border-t border-border bg-card">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Nemai Roy. DSA Mentor AI.</p>
          <div className="flex gap-4"><Link href="/" className="hover:text-foreground">Home</Link><Link href="/sign-in" className="hover:text-foreground">Sign in</Link></div>
        </div>
      </footer>
    </div>
  );
}
