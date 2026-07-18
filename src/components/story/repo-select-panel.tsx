"use client";

import { motion } from "framer-motion";
import { Check, LoaderCircle, Search } from "lucide-react";
import type { RepoOption } from "@/lib/types";
import { cn } from "@/lib/utils";
import { fieldClass } from "@/components/ui/field";

const ease = [0.22, 1, 0.36, 1] as const;

function repoMeta(repo: RepoOption) {
  return repo.language || repo.fullName;
}

function RepoSkeletonList() {
  return (
    <ul className="mt-4 space-y-2" aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => (
        <li
          key={i}
          className="flex animate-pulse items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2.5"
        >
          <div className="h-8 w-8 shrink-0 rounded-lg bg-white/10" />
          <div className="min-w-0 flex-1 space-y-2">
            <div
              className="h-3.5 rounded bg-white/10"
              style={{ width: `${46 + (i % 3) * 12}%` }}
            />
            <div
              className="h-2.5 rounded bg-white/5"
              style={{ width: `${32 + (i % 2) * 18}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function RepoImportLoading({ repoName }: { repoName: string }) {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#0a0a0c] px-6 py-16 text-center shadow-[0_24px_80px_-24px_rgba(0,0,0,0.8)]">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
        className="text-accent"
      >
        <LoaderCircle className="h-8 w-8" aria-hidden />
      </motion.div>
      <p className="mt-5 text-base font-medium text-white" role="status">
        Reading {repoName}…
      </p>
      <p className="mt-2 max-w-[28ch] text-sm leading-relaxed text-zinc-500">
        Pulling README, commits, CI, and stack into four recruiter-ready cards
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {["README", "Commits", "CI", "Releases"].map((chip, i) => (
          <motion.span
            key={chip}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 * i, duration: 0.3, ease }}
            className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-[10px] tracking-wide text-zinc-400"
          >
            {chip}
          </motion.span>
        ))}
      </div>
    </div>
  );
}

export function RepoSelectPanel({
  repos,
  filteredRepos,
  selectedId,
  query,
  loading,
  error,
  onQueryChange,
  onSelect,
  onImport,
}: {
  repos: RepoOption[];
  filteredRepos: RepoOption[];
  selectedId: string;
  query: string;
  loading: boolean;
  error: string | null;
  onQueryChange: (value: string) => void;
  onSelect: (repo: RepoOption) => void;
  onImport: (repo: RepoOption) => void;
}) {
  const selected = filteredRepos.find((r) => r.id === selectedId);

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="rounded-2xl border border-white/10 bg-[#0a0a0c] p-4 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.8)] sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-base font-medium text-white sm:text-lg">Select repository</p>
          <span className="font-mono text-[10px] tracking-wider text-zinc-500 uppercase">
            Step 1
          </span>
        </div>
        <p className="mt-1 text-sm text-zinc-500">
          Import from GitHub to generate your carousel
        </p>

        <div className="relative mt-4">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-500"
            aria-hidden
          />
          <label htmlFor="repo-search" className="sr-only">
            Search repositories
          </label>
          <input
            id="repo-search"
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search repositories…"
            className={cn(
              fieldClass,
              "border-white/10 bg-white/[0.03] py-2.5 pr-4 pl-10 text-sm text-white placeholder:text-zinc-600",
            )}
          />
        </div>

        {error ? (
          <p className="mt-3 text-sm text-red-400" role="alert">
            {error}
          </p>
        ) : null}

        {loading ? (
          <RepoSkeletonList />
        ) : filteredRepos.length === 0 ? (
          <p className="mt-6 text-center text-sm text-zinc-500">
            {repos.length === 0
              ? "No repositories found on this account."
              : "No repositories match that search."}
          </p>
        ) : (
          <ul className="mt-4 max-h-[min(52vh,420px)] space-y-2 overflow-y-auto [scrollbar-width:thin]">
            {filteredRepos.map((repo) => {
              const active = repo.id === selectedId;
              return (
                <li key={repo.id}>
                  <button
                    type="button"
                    aria-pressed={active}
                    onClick={() => onSelect(repo)}
                    onDoubleClick={() => {
                      onSelect(repo);
                      onImport(repo);
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors duration-200",
                      active
                        ? "border-accent/40 bg-accent-soft"
                        : "border-white/8 bg-white/[0.03] hover:border-white/15",
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-mono text-xs",
                        active
                          ? "bg-accent/20 text-accent"
                          : "bg-white/5 text-zinc-400",
                      )}
                    >
                      {repo.name.slice(0, 2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">{repo.name}</p>
                      <p className="truncate font-mono text-[10px] text-zinc-500">
                        {repoMeta(repo)}
                      </p>
                    </div>
                    {active ? (
                      <motion.span
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", duration: 0.35, bounce: 0 }}
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-accent-fg"
                      >
                        <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                      </motion.span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/8 pt-4">
          <p className="min-w-0 truncate text-xs text-zinc-500">
            {selected
              ? selected.fullName
              : loading
                ? "Loading repositories…"
                : `${filteredRepos.length} of ${repos.length} shown`}
          </p>
          <button
            type="button"
            disabled={!selected}
            onClick={() => selected && onImport(selected)}
            className={cn(
              "inline-flex h-9 shrink-0 items-center rounded-full px-4 text-sm font-medium transition-[transform,background-color,opacity] duration-150",
              selected
                ? "bg-accent text-accent-fg hover:bg-accent-hover active:scale-[0.97]"
                : "cursor-not-allowed bg-white/10 text-zinc-500",
            )}
          >
            Import & continue
          </button>
        </div>
      </div>
    </div>
  );
}
