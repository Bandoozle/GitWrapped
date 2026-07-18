"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { GitBranch } from "lucide-react";

const NAV_LINKS = [
  { href: "/#examples", label: "Examples" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/#what-it-shows", label: "What It Shows" },
  { href: "/#faq", label: "FAQ" },
] as const;

const linkClass =
  "rounded-full px-2.5 py-2 text-sm whitespace-nowrap text-white/90 transition-colors duration-150 hover:text-accent sm:px-3.5";

const ctaClass =
  "inline-flex h-10 shrink-0 items-center rounded-full bg-accent px-4 text-sm font-medium text-accent-fg transition-[transform,background-color] duration-150 ease-out hover:bg-accent-hover active:scale-[0.97] sm:px-5";

export function SiteNav() {
  const { status } = useSession();
  const signedIn = status === "authenticated";

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-30 flex justify-center px-3 pt-4 sm:px-4 sm:pt-5">
      <nav
        aria-label="Primary"
        className="pointer-events-auto flex max-w-full items-center gap-0.5 rounded-full border border-white/10 bg-[#141414]/95 p-1.5 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.65)] backdrop-blur-md sm:gap-1"
      >
        <Link
          href="/"
          aria-label="GitWrapped home"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-fg transition-transform duration-150 ease-out hover:scale-[1.03] hover:bg-accent-hover active:scale-[0.97]"
        >
          <GitBranch className="h-4 w-4" strokeWidth={2.25} aria-hidden="true" />
        </Link>

        <div className="flex items-center gap-0 overflow-x-auto px-0.5 [scrollbar-width:none] sm:gap-0.5 sm:px-1 [&::-webkit-scrollbar]:hidden">
          {NAV_LINKS.map((link, i) => (
            <a
              key={link.href}
              href={link.href}
              className={
                i === 0 || i === NAV_LINKS.length - 1
                  ? linkClass
                  : `hidden md:inline-flex ${linkClass}`
              }
            >
              {link.label}
            </a>
          ))}
        </div>

        {signedIn ? (
          <button type="button" onClick={() => signOut({ callbackUrl: "/" })} className={ctaClass}>
            Sign out
          </button>
        ) : (
          <Link href="/login" className={ctaClass}>
            Sign In
          </Link>
        )}
      </nav>
    </header>
  );
}
