import React, { useState } from 'react';
import { Search, Loader2, ShieldAlert, ExternalLink, AtSign, Mail, Radar, Hexagon, Lock } from 'lucide-react';
import * as api from './api';
import StanceCard from './components/StanceCard';
import EmailLookup from './components/EmailLookup';
import SocialAnalyzer from './components/SocialAnalyzer';
import Home from './components/Home';

const STEP = { IDLE: 'idle', DISCOVER: 'discover', COLLECT: 'collect', ANALYZE: 'analyze' };

function Eyebrow({ index, children }) {
  return (
    <div className="flex items-center gap-3">
      <span className="eyebrow text-accent/80">{index}</span>
      <span className="eyebrow">{children}</span>
      <span className="h-px flex-1 bg-white/10" />
    </div>
  );
}

export default function App() {
  const [view, setView] = useState('home'); // 'home' | 'console'
  const [mode, setMode] = useState('handle'); // 'handle' | 'email' | 'social'
  const [handle, setHandle] = useState('');
  const [busy, setBusy] = useState(null); // which step is running
  const [activePlatform, setActivePlatform] = useState(null); // platform being analyzed
  const [error, setError] = useState(null);
  const [discovery, setDiscovery] = useState(null);
  const [collected, setCollected] = useState(null);
  const [analysis, setAnalysis] = useState(null);

  function reset() {
    setError(null);
    setDiscovery(null);
    setCollected(null);
    setAnalysis(null);
  }

  async function runDiscover(e) {
    e?.preventDefault();
    const h = handle.trim().replace(/^@/, '');
    if (!h) return;
    reset();
    setBusy(STEP.DISCOVER);
    try {
      setDiscovery(await api.discover(h));
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setBusy(null);
    }
  }

  async function runAnalyze(platform) {
    const h = handle.trim().replace(/^@/, '');
    setError(null);
    setCollected(null);
    setAnalysis(null);
    setActivePlatform(platform);
    setBusy(STEP.COLLECT);
    try {
      const c = await api.collect(platform, h);
      setCollected(c);
      if (c.empty || !c.posts?.length) {
        setError(c.note || 'No public content returned for this account.');
        return;
      }
      setBusy(STEP.ANALYZE);
      setAnalysis(await api.analyze(h, c.profile, c.posts));
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setBusy(null);
      setActivePlatform(null);
    }
  }

  const TABS = [
    { id: 'handle', label: 'Handle', icon: AtSign },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'social', label: 'Social Analyser', icon: Radar },
  ];

  if (view === 'home') {
    return <Home onLaunch={() => setView('console')} />;
  }

  return (
    <div className="min-h-screen">
      {/* Top console bar */}
      <header className="border-b border-white/10 bg-black/30 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4">
          <button onClick={() => setView('home')} className="flex items-center gap-3 text-left">
            <div className="ticked flex h-9 w-9 items-center justify-center border border-accent/40 bg-accent/10">
              <Hexagon className="h-4 w-4 text-accent" />
            </div>
            <div className="leading-tight">
              <div className="font-mono text-sm font-bold tracking-[0.3em] text-white">LUMEN</div>
              <div className="eyebrow">Social Intelligence Console</div>
            </div>
          </button>
          <div className="hidden items-center gap-2 sm:flex">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            <span className="eyebrow text-slate-500">System Online</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 py-10">
        {/* Mode toggle — segmented control */}
        <div className="inline-flex border border-white/10 bg-white/[0.02]">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = mode === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setMode(t.id)}
                className={`flex items-center gap-2 border-r border-white/10 px-4 py-2 font-mono text-[11px] uppercase tracking-wider transition last:border-r-0 ${
                  active
                    ? 'bg-accent/15 text-white'
                    : 'text-slate-500 hover:bg-white/[0.03] hover:text-slate-300'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${active ? 'text-accent' : ''}`} /> {t.label}
              </button>
            );
          })}
        </div>

        <div className="mt-6">
          {mode === 'email' && <EmailLookup />}
          {mode === 'social' && <SocialAnalyzer />}

          {mode === 'handle' && (
            <>
              {/* Search */}
              <form onSubmit={runDiscover} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
                  <input
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    placeholder="TARGET HANDLE — e.g. natgeo"
                    className="w-full border border-white/10 bg-black/30 py-3 pl-10 pr-3 font-mono text-sm text-white placeholder-slate-600 outline-none transition focus:border-accent/60"
                  />
                </div>
                <button
                  type="submit"
                  disabled={busy === STEP.DISCOVER}
                  className="flex items-center gap-2 border border-accent/40 bg-accent/15 px-5 font-mono text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-accent/25 disabled:opacity-40"
                >
                  {busy === STEP.DISCOVER ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
                </button>
              </form>

              <p className="mt-2 flex items-center gap-1.5 font-mono text-xs text-slate-500">
                <Lock className="h-3 w-3 text-amber-400/80" />
                Public profiles only — private accounts can&apos;t be pulled for analysis.
              </p>

              {error && (
                <div className="mt-5 flex items-start gap-2 border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">
                  <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Discovery results */}
              {discovery && (
                <section className="mt-10 space-y-8">
                  <div>
                    <Eyebrow index="01">Analyze content</Eyebrow>
                    <p className="mt-2 font-mono text-xs text-slate-500">
                      Pull posts from {handle.trim().replace(/^@/, '') || 'target'} and run interest &amp;
                      stance analysis.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {['Instagram', 'TikTok'].map((platform) => (
                        <button
                          key={platform}
                          onClick={() => runAnalyze(platform)}
                          disabled={!!busy}
                          className="ticked flex items-center gap-2 border border-accent/40 bg-accent/10 px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-accent/20 disabled:opacity-40"
                        >
                          {busy && activePlatform === platform ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : null}
                          Analyze {platform}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Eyebrow index="02">Footprint · {discovery.count} platforms</Eyebrow>
                    <div className="mt-4 flex flex-wrap gap-px bg-white/5">
                      {discovery.sites.map((s) => (
                        <div
                          key={s.platform + s.url}
                          className="flex items-center gap-2 bg-ink-950 px-3 py-1.5 font-mono text-xs text-slate-400"
                        >
                          <span>{s.platform}</span>
                          {s.url && (
                            <a
                              href={s.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-slate-600 hover:text-accent"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {(busy === STEP.COLLECT || busy === STEP.ANALYZE) && (
                <div className="mt-8 flex items-center gap-3 border border-white/10 bg-white/[0.02] p-4 font-mono text-xs text-slate-400">
                  <Loader2 className="h-4 w-4 animate-spin text-accent" />
                  {busy === STEP.COLLECT ? 'ACQUIRING PUBLIC POSTS…' : 'ANALYZING INTERESTS & STANCES…'}
                </div>
              )}

              {/* Analysis results */}
              {analysis && (
                <section className="mt-10 space-y-8">
                  {collected?.profile && (
                    <div className="ticked flex items-center gap-4 border border-white/10 bg-white/[0.02] p-4">
                      {collected.profile.image && (
                        <img
                          src={collected.profile.image}
                          alt=""
                          className="h-14 w-14 border border-white/10 object-cover"
                          referrerPolicy="no-referrer"
                        />
                      )}
                      <div className="min-w-0">
                        <div className="font-semibold text-white">
                          {collected.profile.displayName || analysis.handle}
                        </div>
                        <div className="font-mono text-xs text-slate-500">
                          @{collected.profile.username} · {collected.platform}
                          {collected.profile.followers != null &&
                            ` · ${Number(collected.profile.followers).toLocaleString()} followers`}
                        </div>
                      </div>
                    </div>
                  )}

                  {analysis.summary && (
                    <div>
                      <Eyebrow index="03">Summary</Eyebrow>
                      <p className="mt-3 text-sm leading-relaxed text-slate-300">{analysis.summary}</p>
                    </div>
                  )}

                  {analysis.interests?.length > 0 && (
                    <div>
                      <Eyebrow index="04">Interests</Eyebrow>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {analysis.interests.map((it, i) => (
                          <span
                            key={i}
                            className="border border-white/10 bg-white/[0.02] px-3 py-1 text-sm text-slate-200"
                          >
                            {it.topic}
                            <span className="ml-2 font-mono text-[10px] uppercase tracking-wider text-slate-500">
                              {it.strength}
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {analysis.stances?.length > 0 && (
                    <div>
                      <Eyebrow index="05">Stances · evidence-backed</Eyebrow>
                      <div className="mt-4 space-y-3">
                        {analysis.stances.map((s, i) => (
                          <StanceCard key={i} stance={s} />
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="border-t border-white/5 pt-4 text-center font-mono text-[10px] uppercase tracking-wider text-slate-600">
                    Analysis · {analysis.model} · public data only · verify evidence before acting
                  </p>
                </section>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
