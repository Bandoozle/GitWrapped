"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { buttonClass } from "@/components/ui/button";
import { HeroUseCaseDemo } from "@/components/landing/hero-demo";
import { TemplatesSection } from "@/components/landing/templates";
import { SiteNav } from "@/components/site-nav";

const ease = [0.22, 1, 0.36, 1] as const;

const CARDS = [
  {
    n: "01",
    name: "Project Snapshot",
    purpose: "What is this, why does it exist, and can I see it?",
    does: [
      "Problem + solution in one line",
      "Role, stack, and project status",
      "Optional project screenshot",
    ],
  },
  {
    n: "02",
    name: "What I Built",
    purpose: "What did this developer actually deliver?",
    does: [
      "Three or four product capabilities",
      "Translated from README and history",
      "Editable — never a raw commit dump",
    ],
  },
  {
    n: "03",
    name: "How It Works",
    purpose: "What technical depth and judgment are behind it?",
    does: [
      "Small architecture flow",
      "Three or four evidence-backed highlights",
      "Tests, CI, APIs — only if detected",
    ],
  },
  {
    n: "04",
    name: "What It Achieved",
    purpose: "What did this project get done?",
    does: [
      "Outcomes and delivery milestones",
      "Editable achievement points",
      "Never invents user or business metrics",
    ],
  },
] as const;

const HOW_STEPS = [
  {
    n: "01",
    title: "Import a repository",
    body: "Connect GitHub and pick a project. We read the README, commits, CI, and stack — not as a dump, as a story.",
  },
  {
    n: "02",
    title: "Shape the four cards",
    body: "Edit capabilities, architecture, and outcomes. Every generated line shows its source so you stay in control.",
  },
  {
    n: "03",
    title: "Share a live carousel",
    body: "Export for LinkedIn or send a live link. Recruiters see the project, your contribution, and what it achieved.",
  },
] as const;

const FAQS = [
  {
    q: "What does GitWrapped generate?",
    a: "A four-card carousel: Project Snapshot, What I Built, How It Works, and What It Achieved — built from your GitHub repository.",
  },
  {
    q: "Do I need a live demo?",
    a: "No. You can ship a prototype story with releases, CI, screenshots, and GitHub links. Add a demo URL when you have one.",
  },
  {
    q: "Will it invent impact metrics?",
    a: "Never. Achievement points stay delivery-focused. You control every line before you share.",
  },
  {
    q: "Can I edit after import?",
    a: "Yes. Reorder points, rewrite wording, inspect sources, hide noise, and add verified details before you share.",
  },
] as const;

function Hero() {
  return (
    <section className="relative overflow-hidden pt-24 pb-16 sm:pt-28 sm:pb-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 90% 50% at 50% -10%, rgba(163,230,53,0.12), transparent 55%)",
        }}
      />

      <div className="mx-auto grid max-w-5xl items-center gap-10 px-6 lg:grid-cols-[minmax(0,1fr)_440px] lg:gap-12">
        <div className="min-w-0 text-center lg:text-left">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease }}
            className="font-display text-5xl tracking-tight text-foreground sm:text-6xl lg:text-7xl lg:leading-[0.95]"
          >
            GitWrapped
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.04, ease }}
            className="mt-4 text-xl font-medium tracking-tight text-balance text-foreground/90 sm:text-2xl lg:text-[1.65rem] lg:leading-snug"
          >
            Turn your repository into a story worth sharing.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1, ease }}
            className="mx-auto mt-4 max-w-md text-base text-pretty text-muted sm:text-lg lg:mx-0"
          >
            Import from GitHub. Shape a four-card recruiter-ready carousel. Share a
            live link — then make it your own.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.16, ease }}
            className="mt-8 flex justify-center lg:justify-start"
          >
            <Link
              href="/login"
              className={buttonClass("primary", "lg", "rounded-full")}
            >
              Create Your Carousel
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.14, ease }}
          className="w-full max-w-[440px] justify-self-center lg:w-[440px] lg:max-w-none lg:justify-self-end"
          aria-label="Product demo: import a repository and generate a four-card carousel"
        >
          <HeroUseCaseDemo />
        </motion.div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-28 border-t border-border">
      <div className="mx-auto max-w-5xl px-6 py-20">
        <h2 className="font-display text-3xl tracking-tight sm:text-4xl">How It Works</h2>
        <p className="mt-3 max-w-xl text-muted">
          Three steps from a GitHub repo to a carousel recruiters can actually read.
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {HOW_STEPS.map((step) => (
            <div
              key={step.n}
              className="rounded-2xl border border-border bg-surface p-5"
            >
              <p className="font-mono text-[11px] tracking-wider text-muted">{step.n}</p>
              <h3 className="mt-3 text-lg font-medium tracking-tight">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhatItShows() {
  return (
    <section id="what-it-shows" className="scroll-mt-28 border-t border-border">
      <div className="mx-auto max-w-5xl px-6 py-20">
        <h2 className="font-display text-3xl tracking-tight sm:text-4xl">What It Shows</h2>
        <p className="mt-3 max-w-xl text-muted">
          Four cards. One job each. Built for recruiters, not commit graphs.
        </p>
        <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section id="faq" className="scroll-mt-28 border-t border-border">
      <div className="mx-auto max-w-5xl px-6 py-20 pb-24">
        <h2 className="font-display text-3xl tracking-tight sm:text-4xl">FAQ</h2>
        <p className="mt-3 max-w-xl text-muted">Straight answers before you connect GitHub.</p>
        <dl className="mt-10 divide-y divide-border border-y border-border">
          {FAQS.map((item) => (
            <div key={item.q} className="grid gap-2 py-5 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)] sm:gap-8">
              <dt className="text-sm font-medium text-foreground sm:text-base">{item.q}</dt>
              <dd className="text-sm leading-relaxed text-muted sm:text-base">{item.a}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export function LandingPage() {
  return (
    <div className="relative z-10 min-h-screen bg-background text-foreground">
      <SiteNav />
      <Hero />
      <TemplatesSection />
      <HowItWorks />
      <WhatItShows />
      <Faq />
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-medium text-foreground">GitWrapped</p>
            <p className="mt-2 text-sm text-muted">
              Created by{" "}
              <a
                href="https://marcosuteja.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground underline-offset-4 transition-colors hover:underline"
              >
                Marco Areliano Suteja
              </a>
            </p>
          </div>
          <div className="flex flex-col gap-2 text-sm sm:items-end">
            <a
              href="https://marcosuteja.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted transition-colors hover:text-foreground"
            >
              marcosuteja.com
            </a>
            <a
              href="https://linkedin.com/in/marcosuteja"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted transition-colors hover:text-foreground"
            >
              LinkedIn
            </a>
            <a
              href="https://github.com/Bandoozle"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted transition-colors hover:text-foreground"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
