"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GitBranch,
  GitPullRequest,
  GitCommitHorizontal,
  Users,
  Search,
  Loader2,
  Star,
  GitFork,
  CircleDot,
  ArrowRight,
} from "lucide-react";
const EASE = [0.22, 1, 0.36, 1] as const;

const FEATURES = [
  {
    icon: GitPullRequest,
    title: "PR velocity",
    description:
      "Open, merged, and average time-to-merge across every repo you track.",
    tint: "var(--ember-accent)",
  },
  {
    icon: GitCommitHorizontal,
    title: "Commit activity",
    description: "Who's shipping and how often, on a rolling 30-day chart.",
    tint: "var(--ember-coral)",
  },
  {
    icon: Users,
    title: "Contributor activity",
    description: "A leaderboard of who's committing the most, every sync.",
    tint: "var(--ember-gold)",
  },
  {
    icon: Star,
    title: "Repo health trends",
    description: "Stars, forks, and open issues charted over time.",
    tint: "var(--ember-accent)",
  },
  {
    icon: Search,
    title: "Public repo lookup",
    description: "Check any public repo's stats — no login required.",
    tint: "var(--ember-coral)",
  },
  {
    icon: GitBranch,
    title: "Low-cost pricing",
    description: "Free for public repos. ₹199/mo once you go private.",
    tint: "var(--ember-gold)",
  },
];

const STATS = [
  { value: "2 min", label: "To first sync" },
  { value: "₹199", label: "Pro plan / mo" },
  { value: "30 day", label: "Free history" },
  { value: "0", label: "Config beyond login" },
];

type PublicRepoSummary = {
  fullName: string;
  description: string | null;
  stars: number;
  forks: number;
  openIssues: number;
  language: string | null;
  recentPRs: { open: number; merged: number; sampled: number };
};

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <LandingHeader />
      <Hero />
      <DashboardMockup />
      <StatsStrip />
      <FeaturesGrid />
      <FinalCta />
      <LandingFooter />
    </div>
  );
}

function LandingHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[var(--ember-border-soft)] bg-[var(--ember-canvas)]/60 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--ember-accent)] text-[var(--ember-canvas)]"
            style={{ boxShadow: "0 4px 20px -4px rgba(255,107,44,.7)" }}
          >
            <GitBranch className="h-4.5 w-4.5" strokeWidth={2.5} />
          </span>
          <span className="text-[15px] font-medium tracking-tight">GitPulse</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/pricing" className="text-[var(--ember-muted)] transition-colors hover:text-[var(--ember-text)]">
            Pricing
          </Link>
          <Link href="/dashboard" className="text-[var(--ember-muted)] transition-colors hover:text-[var(--ember-text)]">
            Dashboard
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full bg-[var(--ember-text)] px-4 py-1.5 text-[13px] font-medium text-[var(--ember-canvas)] transition-transform hover:scale-[1.04]"
          >
            Sign in
          </Link>
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative flex flex-col items-center px-6 pt-44 pb-28 text-center">
      <AmbientGlow />
      <div className="bg-grid-fade pointer-events-none absolute inset-0 top-0 h-[640px]" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="relative mb-7 flex items-center gap-2 rounded-full border border-[var(--ember-border)] bg-[var(--ember-surface)]/80 px-3.5 py-1.5"
      >
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--ember-accent)] opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--ember-accent)]" />
        </span>
        <span
          className="text-[11px] tracking-[0.16em] text-[var(--ember-muted)] uppercase"
          style={{ fontFamily: "var(--font-label), monospace" }}
        >
          Live · synced from GitHub
        </span>
      </motion.div>

      <div className="relative max-w-4xl">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.09 }}
          className="text-[2.75rem] leading-[1.02] font-medium tracking-[-0.03em] sm:text-6xl md:text-7xl"
        >
          See where PRs get stuck.
          <br />
          Ship{" "}
          <em
            className="not-italic text-[var(--ember-accent)]"
            style={{ fontFamily: "var(--font-editorial), serif", fontStyle: "italic" }}
          >
            faster
          </em>
          .
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.18 }}
          className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-[var(--ember-muted)] sm:text-lg"
        >
          GitPulse tracks pull request velocity, commit activity, and
          contributor stats across your repos — synced from GitHub, so you
          always know how your team is actually shipping.
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE, delay: 0.27 }}
        className="relative mt-10 w-full max-w-xl"
      >
        <HeroSearch />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE, delay: 0.36 }}
        className="relative mt-8 flex flex-wrap items-center justify-center gap-4"
      >
        <Link
          href="/dashboard"
          className="group flex items-center gap-1.5 rounded-full bg-[var(--ember-accent)] px-6 py-3 text-[15px] font-medium text-[#1a0d05] transition-transform hover:scale-[1.04] active:scale-[0.98]"
          style={{ boxShadow: "0 8px 30px -8px rgba(255,107,44,.55)" }}
        >
          Get started free
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
        <Link
          href="/pricing"
          className="rounded-full border border-[var(--ember-border)] px-6 py-3 text-[15px] font-medium text-[var(--ember-text)] transition-colors hover:bg-[var(--ember-surface)]"
        >
          See pricing
        </Link>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.5 }}
        className="relative mt-8 text-xs text-[var(--ember-faint)]"
      >
        No credit card for the free tier · 2-minute setup · GitHub OAuth
      </motion.p>
    </section>
  );
}

function AmbientGlow() {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute top-0 left-1/2 -z-10 h-[640px] w-[900px] -translate-x-1/2 blur-3xl"
      style={{
        background:
          "radial-gradient(ellipse at center, rgba(255,107,44,.38), rgba(255,61,110,.14) 42%, transparent 72%)",
      }}
      animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
      transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

function HeroSearch() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("vercel/next.js");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PublicRepoSummary | null>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim().replace(/^https?:\/\/github\.com\//, "");
    if (!trimmed.includes("/")) {
      setError("Enter a repo as owner/name");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/public/${trimmed}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Repo not found");
      }
      setResult(await res.json());
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <form onSubmit={handleSearch} className="group relative">
        <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-[var(--ember-faint)]" />
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Look up any public repo…"
          className="h-13 w-full rounded-2xl border border-[var(--ember-border)] bg-[var(--ember-surface)]/70 pr-16 pl-11 text-[15px] text-[var(--ember-text)] placeholder-[var(--ember-faint)] backdrop-blur-sm transition-all outline-none focus:border-[var(--ember-accent)] focus:ring-2 focus:ring-[var(--ember-accent)]/40"
        />
        <kbd
          className="absolute top-1/2 right-3 hidden -translate-y-1/2 items-center rounded-md border border-[var(--ember-border)] px-1.5 py-0.5 text-[10px] text-[var(--ember-faint)] sm:flex"
          style={{ fontFamily: "var(--font-label), monospace" }}
        >
          ⌘K
        </kbd>
      </form>

      <AnimatePresence mode="wait">
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 text-sm text-[var(--ember-coral)]"
          >
            {error}
          </motion.p>
        )}

        {result && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="mt-3 rounded-2xl border border-[var(--ember-border)] bg-[var(--ember-surface)] p-5 text-left"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{result.fullName}</span>
              {result.language && (
                <span className="rounded-full bg-[var(--ember-surface-alt)] px-2.5 py-0.5 text-xs text-[var(--ember-muted)]">
                  {result.language}
                </span>
              )}
            </div>
            {result.description && (
              <p className="mt-1 text-sm text-[var(--ember-muted)]">{result.description}</p>
            )}
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-[var(--ember-muted)]">
              <span className="flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 text-[var(--ember-gold)]" />
                {result.stars.toLocaleString()}
              </span>
              <span className="flex items-center gap-1.5">
                <GitFork className="h-3.5 w-3.5 text-[var(--ember-coral)]" />
                {result.forks.toLocaleString()}
              </span>
              <span className="flex items-center gap-1.5">
                <CircleDot className="h-3.5 w-3.5 text-[var(--ember-accent)]" />
                {result.openIssues.toLocaleString()} open issues
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DashboardMockup() {
  const bars = [38, 62, 45, 80, 55, 90, 70];
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, ease: EASE }}
      className="relative mx-auto mb-32 max-w-5xl px-6"
      style={{ perspective: 1800 }}
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        style={{ transform: "rotateX(9deg)", transformStyle: "preserve-3d" }}
        className="relative overflow-hidden rounded-2xl border border-[var(--ember-border)] bg-gradient-to-b from-[var(--ember-surface)] to-[var(--ember-canvas)] shadow-[0_60px_120px_-40px_rgba(0,0,0,0.7)]"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 left-1/2 h-64 w-[80%] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(255,107,44,.35), transparent 70%)",
          }}
        />
        <div className="flex h-9 items-center gap-1.5 border-b border-[var(--ember-border-soft)] px-4">
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--ember-coral)]/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--ember-gold)]/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--ember-accent)]/60" />
        </div>
        <div className="grid grid-cols-[160px_1fr]">
          <div className="hidden flex-col gap-3 border-r border-[var(--ember-border-soft)] p-4 sm:flex">
            {["Overview", "vercel/next.js", "your-org/api", "your-org/web"].map((item, i) => (
              <div
                key={item}
                className={`rounded-lg px-2.5 py-1.5 text-xs ${i === 1 ? "bg-[var(--ember-surface-alt)] text-[var(--ember-text)]" : "text-[var(--ember-faint)]"}`}
              >
                {item}
              </div>
            ))}
          </div>

          <div className="p-6">
            <div className="mb-6 grid grid-cols-3 gap-3">
              {[
                { label: "Commits (30d)", value: "142", tint: "var(--ember-accent)" },
                { label: "Open PRs", value: "9", tint: "var(--ember-coral)" },
                { label: "Avg. merge time", value: "6.2h", tint: "var(--ember-gold)" },
              ].map((kpi) => (
                <div
                  key={kpi.label}
                  className="rounded-xl border border-[var(--ember-border-soft)] bg-[var(--ember-surface)]/60 p-3.5"
                >
                  <p className="text-[10px] tracking-wide text-[var(--ember-faint)] uppercase">{kpi.label}</p>
                  <p className="mt-1.5 text-xl font-medium" style={{ color: kpi.tint }}>
                    {kpi.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex h-32 items-end gap-2.5 rounded-xl border border-[var(--ember-border-soft)] bg-[var(--ember-surface)]/40 p-4">
              {bars.map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  whileInView={{ height: `${h}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.04, ease: EASE }}
                  className="flex-1 rounded-t-sm"
                  style={{
                    background: "linear-gradient(180deg, var(--ember-accent), var(--ember-coral))",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function StatsStrip() {
  return (
    <section className="mx-auto max-w-5xl border-y border-[var(--ember-border-soft)] px-6 py-14">
      <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: i * 0.08, ease: EASE }}
            className="text-center sm:text-left"
          >
            <p className="text-3xl font-medium tracking-tight sm:text-4xl">{stat.value}</p>
            <p
              className="mt-1.5 text-[11px] tracking-[0.14em] text-[var(--ember-faint)] uppercase"
              style={{ fontFamily: "var(--font-label), monospace" }}
            >
              {stat.label}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function FeaturesGrid() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-28">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: EASE }}
        className="mb-14 max-w-lg"
      >
        <p
          className="mb-3 text-[11px] tracking-[0.16em] text-[var(--ember-accent)] uppercase"
          style={{ fontFamily: "var(--font-label), monospace" }}
        >
          — 02 · What you get
        </p>
        <h2 className="text-3xl font-medium tracking-tight sm:text-4xl">
          Everything that&apos;s{" "}
          <em
            style={{ fontFamily: "var(--font-editorial), serif", fontStyle: "italic" }}
            className="text-[var(--ember-accent)]"
          >
            actually
          </em>{" "}
          built.
        </h2>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: (i % 3) * 0.08, ease: EASE }}
            whileHover={{ y: -5 }}
            style={{ transition: "border-color .3s" }}
            className="group relative overflow-hidden rounded-2xl border border-[var(--ember-border)] bg-[var(--ember-surface)]/50 p-6 hover:border-[var(--ember-accent)]/40"
          >
            <span
              aria-hidden
              className="absolute inset-x-0 top-0 h-px scale-x-0 bg-gradient-to-r from-transparent via-[var(--ember-accent)] to-transparent transition-transform duration-300 group-hover:scale-x-100"
            />
            <span
              className="absolute top-5 right-5 text-[11px] text-[var(--ember-faint)]"
              style={{ fontFamily: "var(--font-label), monospace" }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <div
              className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: `color-mix(in oklab, ${feature.tint} 16%, transparent)` }}
            >
              <feature.icon className="h-5 w-5" style={{ color: feature.tint }} />
            </div>
            <h3 className="mb-1.5 font-medium">{feature.title}</h3>
            <p className="text-sm leading-relaxed text-[var(--ember-muted)]">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="mx-auto max-w-5xl px-6 pb-28">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: EASE }}
        className="relative overflow-hidden rounded-3xl border border-[var(--ember-border)] bg-[var(--ember-surface)] px-8 py-20 text-center"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-1/2 h-[420px] w-[640px] -translate-x-1/2 -translate-y-1/2 blur-3xl"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(255,107,44,.3), rgba(255,61,110,.12) 45%, transparent 75%)",
          }}
        />
        <p
          className="relative mb-4 text-[11px] tracking-[0.16em] text-[var(--ember-accent)] uppercase"
          style={{ fontFamily: "var(--font-label), monospace" }}
        >
          — 03 · Get started
        </p>
        <h2 className="relative mx-auto max-w-lg text-3xl font-medium tracking-tight sm:text-4xl">
          Stop guessing why shipping feels{" "}
          <em style={{ fontFamily: "var(--font-editorial), serif", fontStyle: "italic" }}>
            slow
          </em>
          .
        </h2>
        <Link
          href="/dashboard"
          className="relative mt-8 inline-flex items-center gap-1.5 rounded-full bg-[var(--ember-accent)] px-7 py-3.5 text-[15px] font-medium text-[#1a0d05] transition-transform hover:scale-[1.04] active:scale-[0.98]"
          style={{ boxShadow: "0 8px 30px -8px rgba(255,107,44,.55)" }}
        >
          Get started free
          <ArrowRight className="h-4 w-4" />
        </Link>
      </motion.div>
    </section>
  );
}

function LandingFooter() {
  return (
    <footer className="border-t border-[var(--ember-border-soft)] px-6 py-8">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 text-xs text-[var(--ember-faint)] sm:flex-row">
        <p>© {new Date().getFullYear()} GitPulse</p>
        <div className="flex items-center gap-1.5">
          <Link href="/pricing" className="transition-colors hover:text-[var(--ember-accent)]">
            Pricing
          </Link>
          <span>·</span>
          <Link href="/dashboard" className="transition-colors hover:text-[var(--ember-accent)]">
            Dashboard
          </Link>
        </div>
      </div>
    </footer>
  );
}
