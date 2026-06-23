import React, { useState } from 'react';
import { Radar, Loader2, ShieldAlert, ExternalLink } from 'lucide-react';
import * as api from '../api';
import Elapsed from './Elapsed';

function rateColor(rate) {
  if (rate >= 90) return 'text-emerald-300';
  if (rate >= 60) return 'text-amber-300';
  return 'text-slate-400';
}

function shortCategory(cat) {
  if (!cat) return null;
  const parts = cat.split('>').map((s) => s.trim());
  return parts[parts.length - 1];
}

export default function SocialAnalyzer() {
  const [username, setUsername] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  async function run(e) {
    e?.preventDefault();
    const v = username.trim().replace(/^@/, '');
    if (!v) return;
    setError(null);
    setResult(null);
    setBusy(true);
    try {
      setResult(await api.socialAnalyze(v));
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <form onSubmit={run} className="flex gap-2">
        <div className="relative flex-1">
          <Radar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="TARGET USERNAME — e.g. natgeo"
            className="w-full border border-white/10 bg-black/30 py-3 pl-10 pr-3 font-mono text-sm text-white placeholder-slate-600 outline-none transition focus:border-accent/60"
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="flex items-center gap-2 border border-accent/40 bg-accent/15 px-5 font-mono text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-accent/25 disabled:opacity-40"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Analyse'}
        </button>
      </form>

      <p className="mt-2 font-mono text-xs text-slate-500">
        High-precision profile detection with a confidence rate and a site category for each hit.
      </p>

      {error && (
        <div className="mt-5 flex items-start gap-2 border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {busy && (
        <div className="mt-8 border border-white/10 bg-white/[0.02] p-4 font-mono text-xs text-slate-400">
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-3">
              <Loader2 className="h-4 w-4 animate-spin text-accent" />
              DETECTING PROFILES AND RATING CONFIDENCE…
            </span>
            <span className="text-accent">
              <Elapsed />
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-600">Working — this can take 30–60s. Please don&apos;t refresh.</div>
        </div>
      )}

      {result && (
        <section className="mt-8">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent/80">DETECTED</span>
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500">
              {result.count} profiles · sorted by confidence
            </span>
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <div className="mt-4 space-y-px bg-white/5">
            {result.profiles.map((p, i) => {
              const cat = shortCategory(p.category);
              const adult = /adult/i.test(p.category || '');
              return (
                <div
                  key={i}
                  className="flex items-center justify-between gap-3 bg-ink-950 p-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">{p.platform}</span>
                      {cat && (
                        <span
                          className={`border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${
                            adult
                              ? 'border-rose-500/30 bg-rose-500/10 text-rose-300'
                              : 'border-white/10 bg-white/[0.03] text-slate-400'
                          }`}
                        >
                          {cat}
                        </span>
                      )}
                    </div>
                    <a
                      href={p.link}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-0.5 flex items-center gap-1 truncate font-mono text-[11px] text-accent hover:underline"
                    >
                      {p.link} <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  </div>
                  {p.rate != null && (
                    <span className={`shrink-0 font-mono text-sm font-semibold tabular-nums ${rateColor(p.rate)}`}>
                      {p.rate}%
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          <p className="border-t border-white/5 pt-4 mt-6 text-center font-mono text-[10px] uppercase tracking-wider text-slate-600">
            Detection confidence is heuristic · verify before acting
          </p>
        </section>
      )}
    </div>
  );
}
