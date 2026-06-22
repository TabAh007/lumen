import React, { useState } from 'react';
import { Search, Loader2, ShieldAlert, ExternalLink, Sparkles, AtSign, Mail, Radar } from 'lucide-react';
import * as api from './api';
import StanceCard from './components/StanceCard';
import EmailLookup from './components/EmailLookup';
import SocialAnalyzer from './components/SocialAnalyzer';

const STEP = { IDLE: 'idle', DISCOVER: 'discover', COLLECT: 'collect', ANALYZE: 'analyze' };

export default function App() {
  const [mode, setMode] = useState('handle'); // 'handle' | 'email'
  const [handle, setHandle] = useState('');
  const [busy, setBusy] = useState(null); // which step is running
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
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b1020] via-[#0b1020] to-[#0d1226]">
      <div className="mx-auto max-w-3xl px-5 py-12">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/20 ring-1 ring-indigo-400/30">
            <Sparkles className="h-5 w-5 text-indigo-300" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-white">Lumen</h1>
            <p className="text-sm text-slate-400">Social media interest & stance intelligence</p>
          </div>
        </div>

        {/* Mode toggle */}
        <div className="mb-4 inline-flex rounded-lg border border-white/10 bg-white/5 p-1">
          <button
            onClick={() => setMode('handle')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition ${
              mode === 'handle' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <AtSign className="h-3.5 w-3.5" /> By handle
          </button>
          <button
            onClick={() => setMode('email')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition ${
              mode === 'email' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Mail className="h-3.5 w-3.5" /> By email
          </button>
          <button
            onClick={() => setMode('social')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition ${
              mode === 'social' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radar className="h-3.5 w-3.5" /> Social Analyser
          </button>
        </div>

        {mode === 'email' && <EmailLookup />}
        {mode === 'social' && <SocialAnalyzer />}

        {mode === 'handle' && (
        <>
        {/* Search */}
        <form onSubmit={runDiscover} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="Enter a social handle, e.g. natgeo"
              className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-400/50 focus:ring-1 focus:ring-indigo-400/30"
            />
          </div>
          <button
            type="submit"
            disabled={busy === STEP.DISCOVER}
            className="flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-400 disabled:opacity-50"
          >
            {busy === STEP.DISCOVER ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
          </button>
        </form>

        {error && (
          <div className="mt-5 flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Discovery results */}
        {discovery && (
          <section className="mt-8">
            <h2 className="text-sm font-medium uppercase tracking-wide text-slate-500">
              Found on {discovery.count} platforms
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Select Instagram or TikTok to pull posts and run analysis.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {discovery.sites.map((s) => {
                const analyzable = /instagram|tiktok/i.test(s.platform);
                return (
                  <div
                    key={s.platform + s.url}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm ${
                      analyzable
                        ? 'border-indigo-400/30 bg-indigo-500/10 text-indigo-100'
                        : 'border-white/10 bg-white/5 text-slate-300'
                    }`}
                  >
                    <span>{s.platform}</span>
                    {s.url && (
                      <a href={s.url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                    {analyzable && (
                      <button
                        onClick={() => runAnalyze(s.platform)}
                        disabled={!!busy}
                        className="ml-1 rounded bg-indigo-500 px-2 py-0.5 text-xs font-medium text-white hover:bg-indigo-400 disabled:opacity-50"
                      >
                        Analyze
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Busy state for collect/analyze */}
        {(busy === STEP.COLLECT || busy === STEP.ANALYZE) && (
          <div className="mt-8 flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
            <Loader2 className="h-4 w-4 animate-spin text-indigo-300" />
            {busy === STEP.COLLECT ? 'Pulling public posts…' : 'Analyzing interests & stances…'}
          </div>
        )}

        {/* Analysis results */}
        {analysis && (
          <section className="mt-8 space-y-6">
            {collected?.profile && (
              <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                {collected.profile.image && (
                  <img
                    src={collected.profile.image}
                    alt=""
                    className="h-14 w-14 rounded-full object-cover ring-1 ring-white/10"
                    referrerPolicy="no-referrer"
                  />
                )}
                <div className="min-w-0">
                  <div className="font-semibold text-white">
                    {collected.profile.displayName || analysis.handle}
                  </div>
                  <div className="text-sm text-slate-400">
                    @{collected.profile.username} · {collected.platform}
                    {collected.profile.followers != null &&
                      ` · ${Number(collected.profile.followers).toLocaleString()} followers`}
                  </div>
                </div>
              </div>
            )}

            {analysis.summary && (
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                <h2 className="text-sm font-medium uppercase tracking-wide text-slate-500">Summary</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-200">{analysis.summary}</p>
              </div>
            )}

            {analysis.interests?.length > 0 && (
              <div>
                <h2 className="mb-2 text-sm font-medium uppercase tracking-wide text-slate-500">Interests</h2>
                <div className="flex flex-wrap gap-2">
                  {analysis.interests.map((it, i) => (
                    <span
                      key={i}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-200"
                    >
                      {it.topic}
                      <span className="ml-1.5 text-xs text-slate-500">{it.strength}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {analysis.stances?.length > 0 && (
              <div>
                <h2 className="mb-2 text-sm font-medium uppercase tracking-wide text-slate-500">
                  Stances · evidence-backed
                </h2>
                <div className="space-y-3">
                  {analysis.stances.map((s, i) => (
                    <StanceCard key={i} stance={s} />
                  ))}
                </div>
              </div>
            )}

            <p className="pt-2 text-center text-xs text-slate-600">
              Analysis by {analysis.model} · public data only · verify evidence before acting
            </p>
          </section>
        )}
        </>
        )}
      </div>
    </div>
  );
}
