"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  IconAsk,
  IconCalendar,
  IconHome,
  IconMark,
  IconMenu,
  IconMoon,
  IconSearch,
  IconSun,
  IconTrends,
} from "@/components/icons";
import { useTheme } from "@/components/ThemeProvider";

const links = [
  { href: "/", label: "Home", icon: IconHome },
  { href: "/meetings", label: "Meetings", icon: IconCalendar },
  { href: "/ask", label: "Ask Harbor", icon: IconAsk },
  { href: "/search", label: "Search", icon: IconSearch },
  { href: "/highlights", label: "Highlights", icon: IconMark },
  { href: "/trends", label: "Trends", icon: IconTrends },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "/" && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        router.push("/search");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)]">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-56 bg-[var(--sidebar)] px-3 py-5 text-[var(--sidebar-ink)] transition-transform md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Link href="/" className="mb-8 block px-3">
          <span className="block text-[15px] font-semibold tracking-tight">Harbor</span>
          <span className="text-[11px] text-[var(--sidebar-muted)]">AI meeting notes</span>
        </Link>
        <nav className="space-y-0.5">
          {links.map((link) => {
            const active = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors duration-200 ease-out ${
                  active
                    ? "bg-[var(--nav-active)] font-medium text-[var(--sidebar-ink)]"
                    : "text-[var(--sidebar-muted)] hover:bg-[var(--nav-hover)] hover:text-[var(--sidebar-ink)]"
                }`}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <p className="absolute inset-x-5 bottom-5 text-[11px] leading-relaxed text-[var(--sidebar-muted)]">
          Recording is mocked for this demo. Notes, transcripts, and playback are seeded locally.
        </p>
      </aside>

      {open && (
        <button
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="md:pl-56">
        <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-5">
          <div className="flex items-center gap-2">
            <button
              className="rounded-lg p-2 text-[var(--ink-soft)] hover:bg-[var(--nav-hover)] md:hidden"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <IconMenu className="h-5 w-5" />
            </button>
            {pathname === "/" && (
              <p className="hidden text-sm text-[var(--muted)] sm:block">Never miss what was said</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/search"
              className="hidden items-center gap-2 rounded-full px-3 py-1.5 text-xs text-[var(--muted)] hover:bg-[var(--nav-hover)] sm:flex"
            >
              <IconSearch className="h-3.5 w-3.5" />
              Search
              <kbd className="rounded bg-[var(--nav-active)] px-1.5 py-0.5 font-mono text-[10px]">/</kbd>
            </Link>
            <button
              onClick={toggle}
              suppressHydrationWarning
              className="rounded-full p-2 text-[var(--ink-soft)] hover:bg-[var(--nav-hover)]"
              aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            >
              {theme === "dark" ? <IconSun className="h-4 w-4" /> : <IconMoon className="h-4 w-4" />}
            </button>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--avatar)] text-xs font-semibold text-[var(--on-avatar)]">
              AN
            </div>
          </div>
        </div>
        <div className="shell-panel mx-3 mb-3 min-h-[calc(100vh-4.75rem)] md:mx-4 md:mb-4">
          <main key={pathname} className="page-enter px-5 py-6 sm:px-8 sm:py-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
