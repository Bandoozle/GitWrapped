"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { GitBranch } from "lucide-react";
import { cn } from "@/lib/utils";

const LANDING_LINKS = [
  { href: "/#templates", label: "Examples", mobile: true },
  { href: "/#how-it-works", label: "How It Works", mobile: false },
  { href: "/#what-it-shows", label: "What It Shows", mobile: false },
  { href: "/#faq", label: "FAQ", mobile: true },
] as const;

const APP_LINKS = [
  { href: "/dashboard", label: "Projects", mobile: true },
  { href: "/story/new", label: "New", mobile: false },
  { href: "/templates", label: "Templates", mobile: false },
  { href: "/settings", label: "Settings", mobile: true },
] as const;

const linkClass =
  "rounded-full px-2.5 py-1.5 text-sm whitespace-nowrap text-white/90 transition-colors duration-150 hover:text-accent sm:px-3 sm:py-2";

const ctaClass =
  "inline-flex h-9 shrink-0 items-center rounded-full bg-accent px-3.5 text-sm font-medium text-accent-fg transition-[transform,background-color] duration-150 ease-out hover:bg-accent-hover active:scale-[0.97] sm:h-10 sm:px-5";

export function SiteNav() {
  const { status } = useSession();
  const pathname = usePathname();
  const signedIn = status === "authenticated";
  const inApp =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/story") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/templates");

  const links = inApp && signedIn ? APP_LINKS : LANDING_LINKS;

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-30 flex justify-center px-3 pt-3 sm:px-4 sm:pt-5">
      <nav
        aria-label="Primary"
        className="pointer-events-auto flex w-fit max-w-full items-center gap-1 rounded-full border border-white/10 bg-[#141414]/95 p-1 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.65)] backdrop-blur-md sm:gap-1.5 sm:p-1.5"
      >
        <Link
          href={inApp && signedIn ? "/dashboard" : "/"}
          aria-label="GitWrapped home"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-fg transition-transform duration-150 ease-out hover:scale-[1.03] hover:bg-accent-hover active:scale-[0.97] sm:h-10 sm:w-10"
        >
          <GitBranch className="h-4 w-4" strokeWidth={2.25} aria-hidden="true" />
        </Link>

        <div className="flex items-center gap-0.5 px-0.5">
          {links.map((link) => {
            const active =
              inApp &&
              (pathname === link.href ||
                (link.href !== "/dashboard" && pathname.startsWith(link.href)));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  linkClass,
                  !link.mobile && "hidden sm:inline-flex",
                  active && "bg-white/10 text-accent",
                )}
              >
                {link.label}
              </Link>
            );
          })}
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
