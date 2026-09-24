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
  IconSpark,
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
        className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-[var(--line)] bg-[var(--sidebar)] p-4 text-[var(--sidebar-ink)] transition-transform md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Link href="/" className="mb-8 flex items-center gap-2.5 px-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent)] text-[var(--on-accent)] shadow-[var(--shadow)]">
            <IconSpark className="h-5 w-5" />
          </span>
          <span>
            <span className="block font-[family-name:var(--font-display)] text-lg leading-none tracking-tight">
              Harbor
            </span>
            <span className="text-[11px] text-[var(--sidebar-muted)]">AI meeting notes</span>
          </span>
        </Link>
        <nav className="space-y-1">
          {links.map((link) => {
            const active = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors duration-200 ease-out ${
                  active
                    ? "bg-[var(--nav-active)] text-[var(--sidebar-ink)]"
                    : "text-[var(--sidebar-muted)] hover:bg-[var(--nav-hover)] hover:text-[var(--sidebar-ink)]"
                }`}
              >
                <Icon className="h-4 w-4" />
                {link.label}
                <span
                  aria-hidden
                  className={`pointer-events-none absolute bottom-1.5 left-3 h-px w-8 origin-left bg-[var(--accent)] transition-[scale] duration-200 ease-out ${
                    active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-75"
                  }`}
                />
              </Link>
            );
          })}
        </nav>
        <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-[var(--line)] bg-[var(--bg-muted)]/60 p-3">
          <p className="text-[11px] leading-relaxed text-[var(--sidebar-muted)]">
            Recording is mocked for this demo. Notes, transcripts, and playback are seeded locally.
          </p>
        </div>
      </aside>

      {open && (
        <button
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="md:pl-64">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-[var(--line)] bg-[var(--bg)]/85 px-4 py-3 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <button
              className="rounded-lg p-2 text-[var(--ink-soft)] hover:bg-[var(--bg-muted)] md:hidden"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <IconMenu className="h-5 w-5" />
            </button>
            {pathname === "/" && (
              <p className="hidden text-sm text-[var(--muted)] sm:block">
                Never miss what was said
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/search"
              className="hidden items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--bg-elev)] px-3 py-1.5 text-xs text-[var(--muted)] sm:flex"
            >
              <IconSearch className="h-3.5 w-3.5" />
              Search
              <kbd className="rounded bg-[var(--bg-muted)] px-1.5 py-0.5 font-mono text-[10px]">/</kbd>
            </Link>
            <button
              onClick={toggle}
              suppressHydrationWarning
              className="rounded-full border border-[var(--line)] bg-[var(--bg-elev)] p-2 text-[var(--ink-soft)] hover:bg-[var(--bg-muted)]"
              aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            >
              {theme === "dark" ? <IconSun className="h-4 w-4" /> : <IconMoon className="h-4 w-4" />}
            </button>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-semibold text-[var(--on-accent)]">
              AN
            </div>
          </div>
        </header>
        <main key={pathname} className="page-enter px-4 py-6 sm:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
