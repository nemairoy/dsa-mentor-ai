"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Award,
  Bell,
  BookMarked,
  BookOpen,
  Bot,
  ChartNoAxesCombined,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Dumbbell,
  FileText,
  LayoutDashboard,
  Settings,
  Shield,
  User,
} from "lucide-react";

import { BrandLockup, BrandLogo } from "@/components/brand/brand-logo";
import { AnimatedPage } from "@/components/layout/animated-page";
import { AppFooter } from "@/components/layout/app-footer";
import { GlobalSearch } from "@/components/layout/global-search";
import { SignOutButton } from "@/components/layout/sign-out-button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { cn } from "@/lib/utils";

type AppShellProps = {
  children: React.ReactNode;
  userName?: string | null;
  userImage?: string | null;
  showAdmin?: boolean;
};

const primaryLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/learn", label: "Learn DSA with AI", icon: BookOpen },
  { href: "/practice", label: "Practice", icon: Dumbbell },
  { href: "/ai-tutor", label: "AI Tutor", icon: Bot },
  { href: "/notes", label: "Notes", icon: FileText },
  { href: "/bookmarks", label: "Bookmarks", icon: BookMarked },
  { href: "/progress", label: "Progress", icon: ChartNoAxesCombined },
  { href: "/achievements", label: "Achievements", icon: Award },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children, userName, userImage, showAdmin = false }: AppShellProps) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const breadcrumbs = pathname
    .split("/")
    .filter(Boolean)
    .slice(0, 3)
    .map((segment) => segment.replaceAll("-", " "));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-border bg-card/95 px-3 py-4 shadow-sm backdrop-blur transition-[width] duration-200 lg:flex",
          sidebarCollapsed ? "w-20" : "w-60",
        )}
      >
        <div className="flex items-center justify-between gap-1.5">
          <Link
            href="/dashboard"
            className={cn(
              "flex min-w-0 items-center rounded-xl py-2",
              sidebarCollapsed ? "justify-center px-0" : "gap-3 px-2",
            )}
            title="DSA Mentor AI"
          >
            {sidebarCollapsed ? <BrandLogo size="sm" /> : <BrandLockup size="sm" subtitle="Personal learning studio" compact className="gap-2" />}
          </Link>
          {!sidebarCollapsed ? (
            <button
              type="button"
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
              onClick={() => setSidebarCollapsed(true)}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <PanelLeftClose aria-hidden={true} size={18} />
            </button>
          ) : null}
        </div>

        {sidebarCollapsed ? (
          <button
            type="button"
            aria-label="Expand sidebar"
            title="Expand sidebar"
            onClick={() => setSidebarCollapsed(false)}
            className="mt-4 inline-flex h-9 w-full items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <PanelLeftOpen aria-hidden={true} size={19} />
          </button>
        ) : null}

        <nav className="mt-6 min-h-0 flex-1 space-y-0.5 overflow-y-auto pr-1" aria-label="Primary navigation">
          {primaryLinks.map((item) => (
            <SidebarLink
              key={item.href}
              {...item}
              active={pathname === item.href || pathname.startsWith(`${item.href}/`)}
              collapsed={sidebarCollapsed}
            />
          ))}
          {showAdmin ? <SidebarLink href="/admin" label="Admin Studio" icon={Shield} active={pathname.startsWith("/admin")} collapsed={sidebarCollapsed} /> : null}
        </nav>

        <div className={cn("mt-4 rounded-2xl border border-border bg-muted/50 p-3", sidebarCollapsed && "flex justify-center p-2")}>
          <div className="mb-3 flex items-center gap-2">
            <UserAvatar userName={userName} userImage={userImage} size="sm" />
            <div className={cn("min-w-0", sidebarCollapsed && "hidden")}>
              <p className="truncate text-sm font-medium">{userName ?? "Student"}</p>
              <p className="text-xs text-muted-foreground">Keep your streak alive today</p>
            </div>
          </div>
          <div className={cn(sidebarCollapsed && "hidden")}>
            <SignOutButton />
          </div>
        </div>
      </aside>

      <header
        className={cn(
          "sticky top-0 z-20 border-b border-border bg-card/90 px-4 py-2 backdrop-blur transition-[margin] duration-200 lg:px-5",
          sidebarCollapsed ? "lg:ml-20" : "lg:ml-60",
        )}
      >
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex shrink-0 items-center gap-2 font-semibold lg:hidden">
            <BrandLogo size="sm" />
            DSA Mentor AI
          </Link>
          <div className="hidden min-w-0 flex-1 lg:block">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Workspace</p>
            <p className="mt-1 truncate text-sm capitalize text-muted-foreground">
              {breadcrumbs.length ? breadcrumbs.join(" / ") : "Dashboard"}
            </p>
          </div>
          <div className="hidden flex-1 justify-center md:flex">
            <GlobalSearch />
          </div>
          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              aria-label="Notifications"
              title="Notifications"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Bell aria-hidden={true} size={18} />
            </button>
            <ThemeToggle />
            <details className="relative">
              <summary className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <UserAvatar userName={userName} userImage={userImage} size="md" />
              </summary>
              <div className="absolute right-0 top-12 z-50 w-64 rounded-2xl border border-border bg-popover p-3 shadow-xl">
                <div className="mb-3 flex items-center gap-2">
                  <UserAvatar userName={userName} userImage={userImage} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{userName ?? "Student"}</p>
                    <p className="text-xs text-muted-foreground">Learning workspace</p>
                  </div>
                </div>
                <SignOutButton />
              </div>
            </details>
          </div>
        </div>
        <div className="mt-3 md:hidden">
          <GlobalSearch />
        </div>
        <nav className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:hidden" aria-label="Mobile navigation">
          {primaryLinks.slice(0, 6).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "shrink-0 rounded-full border border-border px-3 py-1.5 text-xs",
                pathname === item.href ? "border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-300" : "",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <main
        className={cn(
          "min-h-[calc(100vh-57px)] px-4 py-4 pb-16 transition-[margin] duration-200 lg:px-5 lg:py-5",
          sidebarCollapsed ? "lg:ml-20" : "lg:ml-60",
        )}
      >
        <div className="mx-auto flex min-h-[calc(100vh-105px)] w-full max-w-[1280px] flex-col">
          <div className="flex-1">
            <AnimatedPage>{children}</AnimatedPage>
          </div>
          <AppFooter />
        </div>
      </main>
    </div>
  );
}

function UserAvatar({
  userName,
  userImage,
  size,
}: {
  userName?: string | null;
  userImage?: string | null;
  size: "sm" | "md";
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const initial = (userName ?? "S").charAt(0).toUpperCase();
  const dimensions = size === "sm" ? "h-8 w-8 text-xs" : "h-9 w-9 text-sm";
  const showImage = Boolean(userImage && !imageFailed);

  return (
    <span className={cn("flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted font-semibold text-foreground", dimensions)}>
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={userImage ?? ""}
          alt={userName ? `${userName} profile photo` : "Profile photo"}
          className="h-full w-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        initial
      )}
    </span>
  );
}

function SidebarLink({
  href,
  label,
  icon: Icon,
  active,
  collapsed = false,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string; "aria-hidden"?: boolean }>;
  active?: boolean;
  collapsed?: boolean;
}) {
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={cn(
        "group relative flex min-h-9 items-center rounded-lg text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        collapsed ? "justify-center px-2 py-1.5" : "justify-between px-2.5 py-1.5",
        active && "bg-emerald-100 text-emerald-950 dark:bg-emerald-400/10 dark:text-emerald-200",
      )}
    >
      {active ? <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-emerald-600 dark:bg-emerald-500" aria-hidden={true} /> : null}
      <span className={cn("flex items-center", collapsed ? "justify-center" : "gap-3")}>
        <Icon aria-hidden={true} size={18} className={cn("text-muted-foreground group-hover:text-emerald-700 dark:group-hover:text-emerald-300", active && "text-emerald-700 dark:text-emerald-300")} />
        {collapsed ? <span className="sr-only">{label}</span> : label}
      </span>
      {collapsed ? null : <ChevronRight aria-hidden={true} size={14} className="opacity-0 transition-opacity group-hover:opacity-100" />}
    </Link>
  );
}
