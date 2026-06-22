import React from 'react';
import { Quote } from 'lucide-react';

const DIRECTION_STYLES = {
  pro: { label: 'PRO', cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  anti: { label: 'ANTI', cls: 'bg-rose-500/15 text-rose-300 border-rose-500/30' },
  mixed: { label: 'MIXED', cls: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  unclear: { label: 'UNCLEAR', cls: 'bg-slate-500/15 text-slate-300 border-slate-500/30' },
};

function confidenceColor(c) {
  if (c >= 0.75) return 'bg-emerald-400';
  if (c >= 0.5) return 'bg-amber-400';
  return 'bg-rose-400';
}

export default function StanceCard({ stance }) {
  const dir = DIRECTION_STYLES[stance.direction] || DIRECTION_STYLES.unclear;
  const pct = Math.round((stance.confidence || 0) * 100);

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-base font-semibold text-white">{stance.claim}</h3>
        <span className={`shrink-0 rounded-md border px-2 py-0.5 text-xs font-bold tracking-wide ${dir.cls}`}>
          {dir.label}
        </span>
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Confidence</span>
          <span className="tabular-nums">{pct}%</span>
        </div>
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div className={`h-full rounded-full ${confidenceColor(stance.confidence)}`} style={{ width: `${pct}%` }} />
        </div>
      </div>

      {stance.reasoning && (
        <p className="mt-3 text-sm leading-relaxed text-slate-300">{stance.reasoning}</p>
      )}

      {stance.evidence?.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Evidence</div>
          {stance.evidence.map((e, i) => (
            <div key={i} className="rounded-lg border border-white/5 bg-black/20 p-3">
              <div className="flex gap-2">
                <Quote className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" />
                <p className="text-sm italic text-slate-200">{e.quote}</p>
              </div>
              {e.postUrl && (
                <a
                  href={e.postUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-xs text-indigo-300 hover:text-indigo-200 hover:underline"
                >
                  View source post →
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
