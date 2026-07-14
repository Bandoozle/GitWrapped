"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

const CARDS = [
  {
    n: "01",
    name: "Project",
    purpose: "What is this, and can I see it working?",
    does: [
      "Names the repo and what it does",
      "Shows stack and live demo",
      "Signals active or archived status",
    ],
  },
  {
    n: "02",
    name: "What I Built",
    purpose: "What did the developer actually deliver?",
    does: [
      "Lists features and systems shipped",
      "Pulled from README and commits",
      "Fully editable before you share",
    ],
  },
  {
    n: "03",
    name: "Engineering",
    purpose: "What technical depth is behind it?",
    does: [
      "Auth, APIs, tests, CI, and infra",
      "Decisions over a raw tech list",
      "Stack stays as supporting detail",
    ],
  },
  {
    n: "04",
    name: "Shipped",
    purpose: "Is this finished work?",
    does: [
      "Demo, releases, and checks",
      "Recent meaningful activity",
      "Links to proof it runs",
    ],
  },
] as const;

function LandingNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-sm font-medium tracking-tight">
            GitWrapped
          </Link>
          <nav className="hidden items-center gap-1 text-sm text-muted md:flex">
            <a href="#cards" className="rounded-md px-3 py-1.5 transition-colors hover:text-foreground">
              Cards
            </a>
            <Link
              href="/templates"
              className="rounded-md px-3 py-1.5 transition-colors hover:text-foreground"
            >
              Templates
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden rounded-lg px-3 py-1.5 text-sm text-muted transition-colors hover:text-foreground sm:inline-flex"
          >
            Sign in
          </Link>
          <Link
            href="/login"
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-white px-3 text-sm font-medium !text-black transition hover:bg-white/90"
          >
            Get started
            <ArrowRight className="h-3.5 w-3.5 !text-black" />
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="mx-auto max-w-3xl px-6 pt-16 pb-12 text-center sm:pt-24 sm:pb-16">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease }}
      >
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted transition hover:bg-surface-2 hover:text-foreground"
        >
          Introducing GitWrapped
          <ArrowRight className="h-3 w-3" />
        </Link>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.04, ease }}
        className="mt-6 text-4xl font-medium tracking-tight text-balance sm:text-5xl lg:text-[3.5rem] lg:leading-[1.1]"
      >
        Turn your repository into a story worth sharing.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1, ease }}
        className="mx-auto mt-5 max-w-xl text-base text-pretty text-muted sm:text-lg"
      >
        Import from GitHub. Shape a four-card recruiter-ready carousel. Share a
        live link — then make it your own.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.16, ease }}
        className="mt-8 flex justify-center"
      >
        <Link
          href="/login"
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-white px-5 text-sm font-medium !text-black transition hover:bg-white/90"
        >
          Get started for free
          <ArrowRight className="h-4 w-4 !text-black" />
        </Link>
      </motion.div>
    </section>
  );
}

function CardsBento() {
  return (
    <section id="cards" className="mx-auto max-w-5xl px-6 pb-24">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {CARDS.map((card) => (
          <div
            key={card.n}
            className="flex flex-col rounded-xl border border-border bg-surface p-5"
          >
            <p className="font-mono text-[11px] tracking-wider text-muted">{card.n}</p>
            <h3 className="mt-2 text-lg font-medium tracking-tight">{card.name}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{card.purpose}</p>
            <ul className="mt-5 space-y-2 border-t border-border pt-4">
              {card.does.map((line) => (
                <li key={line} className="flex gap-2.5 text-sm leading-snug">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-foreground/50" />
                  <span className="text-foreground/90">{line}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

export function LandingPage() {
  return (
    <div className="relative z-10 min-h-screen bg-background text-foreground">
      <LandingNav />
      <Hero />
      <CardsBento />
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-6 py-8 text-sm text-muted sm:flex-row">
          <span className="font-medium text-foreground">GitWrapped</span>
          <span>Open source energy. Recruiter-ready cards.</span>
        </div>
      </footer>
    </div>
  );
}
