import React, { useState } from 'react';
import { Radar, Loader2, ShieldAlert, ExternalLink } from 'lucide-react';
import * as api from '../api';

function rateColor(rate) {
  if (rate >= 90) return 'text-emerald-300';
  if (rate >= 60) return 'text-amber-300';
  return 'text-slate-400';
}

// Short, human label for the (sometimes long) category strings.
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
          <Radar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter a username, e.g. natgeo"
            className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-400/50 focus:ring-1 focus:ring-indigo-400/30"
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-400 disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Analyse'}
        </button>
      </form>

      <p className="mt-2 text-xs text-slate-500">
        High-precision profile detection with a confidence rate and a site category for each hit.
      </p>

      {error && (
        <div className="mt-5 flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {busy && (
        <div className="mt-8 flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
          <Loader2 className="h-4 w-4 animate-spin text-indigo-300" />
          Detecting profiles and rating confidence…
        </div>
      )}

      {result && (
        <section className="mt-8">
          <h2 className="text-sm font-medium uppercase tracking-wide text-slate-500">
            {result.count} profiles detected
          </h2>
          <p className="mt-1 text-xs text-slate-500">Sorted by detection confidence.</p>

          <div className="mt-3 space-y-2">
            {result.profiles.map((p, i) => {
              const cat = shortCategory(p.category);
              const adult = /adult/i.test(p.category || '');
              return (
                <div
                  key={i}
                  className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">{p.platform}</span>
                      {cat && (
                        <span
                          className={`rounded border px-1.5 py-0.5 text-xs ${
                            adult
                              ? 'border-rose-500/30 bg-rose-500/10 text-rose-300'
                              : 'border-white/10 bg-white/5 text-slate-400'
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
                      className="mt-0.5 flex items-center gap-1 truncate text-xs text-indigo-300 hover:text-indigo-200 hover:underline"
                    >
                      {p.link} <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  </div>
                  {p.rate != null && (
                    <span className={`shrink-0 text-sm font-semibold tabular-nums ${rateColor(p.rate)}`}>
                      {p.rate}%
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          <p className="pt-6 text-center text-xs text-slate-600">
            Detection confidence is heuristic · verify before acting
          </p>
        </section>
      )}
    </div>
  );
}
