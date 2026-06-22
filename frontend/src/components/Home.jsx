import React from 'react';
import {
  Hexagon,
  AtSign,
  Mail,
  Radar,
  ArrowRight,
  ShieldCheck,
  Search,
  ScanLine,
  FileText,
} from 'lucide-react';

const CAPABILITIES = [
  {
    icon: AtSign,
    tag: 'Handle',
    title: 'Interest & stance analysis',
    body: 'Enter a handle, pull their public Instagram or TikTok posts, and get an AI read on their interests and pro/anti positions — each backed by quoted evidence and a confidence score.',
  },
  {
    icon: Mail,
    tag: 'Email',
    title: 'Account footprint',
    body: 'Enter an email and see which of ~120 platforms have an account registered to it, including any recovery-email or phone hints. The target is never notified.',
  },
  {
    icon: Radar,
    tag: 'Social Analyser',
    title: 'Rated profile detection',
    body: 'Enter a username for a high-precision sweep: detected profiles with a confidence rate and a website category (news, social, gaming, adult…) for each hit.',
  },
];

const STEPS = [
  { icon: Search, title: 'Pick a mode', body: 'Choose Handle, Email, or Social Analyser depending on what you have to start from.' },
  { icon: ScanLine, title: 'Enter a target', body: 'Type a handle, email, or username and run it. Live sources are queried in real time.' },
  { icon: FileText, title: 'Read the dossier', body: 'Review the findings — always with the underlying evidence and confidence, never a bare verdict.' },
];

export default function Home({ onLaunch }) {
  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <header className="border-b border-white/10 bg-black/30 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="ticked flex h-9 w-9 items-center justify-center border border-accent/40 bg-accent/10">
              <Hexagon className="h-4 w-4 text-accent" />
            </div>
            <div className="leading-tight">
              <div className="font-mono text-sm font-bold tracking-[0.3em] text-white">LUMEN</div>
              <div className="eyebrow">Social Intelligence Console</div>
            </div>
          </div>
          <button
            onClick={onLaunch}
            className="flex items-center gap-2 border border-accent/40 bg-accent/15 px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-white transition hover:bg-accent/25"
          >
            Launch Console <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5">
        {/* Hero */}
        <section className="border-b border-white/10 py-20">
          <div className="eyebrow text-accent/80">// OSINT · Threat Intelligence</div>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl">
            Turn a social handle into an evidence-backed intelligence profile.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-400">
            Lumen maps a person&apos;s public online footprint and analyzes what they care about — and where
            they stand — from their own posts. Built for security and threat-intelligence teams who need
            signal, sources, and confidence, not guesses.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              onClick={onLaunch}
              className="ticked flex items-center gap-2 border border-accent/40 bg-accent/15 px-6 py-3 font-mono text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-accent/25"
            >
              Launch Console <ArrowRight className="h-4 w-4" />
            </button>
            <span className="font-mono text-[11px] uppercase tracking-wider text-slate-600">
              Public data only · evidence-first
            </span>
          </div>
        </section>

        {/* Capabilities */}
        <section className="py-16">
          <div className="flex items-center gap-3">
            <span className="eyebrow text-accent/80">01</span>
            <span className="eyebrow">Capabilities</span>
            <span className="h-px flex-1 bg-white/10" />
          </div>
          <div className="mt-8 grid gap-px bg-white/5 sm:grid-cols-3">
            {CAPABILITIES.map((c) => {
              const Icon = c.icon;
              return (
                <div key={c.tag} className="bg-ink-950 p-6">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-accent" />
                    <span className="eyebrow">{c.tag}</span>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-white">{c.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-400">{c.body}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* How to use */}
        <section className="border-t border-white/10 py-16">
          <div className="flex items-center gap-3">
            <span className="eyebrow text-accent/80">02</span>
            <span className="eyebrow">How to use it</span>
            <span className="h-px flex-1 bg-white/10" />
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="panel ticked p-6">
                  <div className="flex items-center justify-between">
                    <Icon className="h-5 w-5 text-accent" />
                    <span className="font-mono text-2xl font-bold text-white/10">0{i + 1}</span>
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-white">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{s.body}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Responsible-use band */}
        <section className="border-t border-white/10 py-16">
          <div className="panel flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
            <ShieldCheck className="h-8 w-8 shrink-0 text-accent" />
            <div>
              <h3 className="font-semibold text-white">Responsible use</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-400">
                Lumen queries only public data and never alerts the people it examines. Use it for authorized
                investigations, and treat every finding as a lead to verify — stance detection is probabilistic,
                so the evidence is always shown alongside the conclusion.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-6">
          <span className="font-mono text-[11px] uppercase tracking-wider text-slate-600">
            Lumen · Social Intelligence Console
          </span>
          <button
            onClick={onLaunch}
            className="font-mono text-[11px] uppercase tracking-wider text-accent hover:underline"
          >
            Launch Console →
          </button>
        </div>
      </footer>
    </div>
  );
}
