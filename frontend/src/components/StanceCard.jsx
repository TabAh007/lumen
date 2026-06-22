import React from 'react';
import { Quote } from 'lucide-react';

const DIRECTION = {
  pro: { label: 'PRO', text: 'text-emerald-300', bar: 'bg-emerald-400', edge: 'border-l-emerald-400/60' },
  anti: { label: 'ANTI', text: 'text-rose-300', bar: 'bg-rose-400', edge: 'border-l-rose-400/60' },
  mixed: { label: 'MIXED', text: 'text-amber-300', bar: 'bg-amber-400', edge: 'border-l-amber-400/60' },
  unclear: { label: 'UNCLEAR', text: 'text-slate-300', bar: 'bg-slate-400', edge: 'border-l-slate-500/60' },
};

const SEGMENTS = 20;

export default function StanceCard({ stance }) {
  const dir = DIRECTION[stance.direction] || DIRECTION.unclear;
  const conf = stance.confidence || 0;
  const pct = Math.round(conf * 100);
  const filled = Math.round(conf * SEGMENTS);

  return (
    <div className={`border border-white/10 border-l-2 ${dir.edge} bg-white/[0.02] p-5`}>
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-base font-semibold text-white">{stance.claim}</h3>
        <span className={`shrink-0 border border-white/10 px-2 py-0.5 font-mono text-[11px] font-bold tracking-widest ${dir.text}`}>
          {dir.label}
        </span>
      </div>

      {/* Segmented confidence meter */}
      <div className="mt-4">
        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-slate-500">
          <span>Confidence</span>
          <span className="tabular-nums text-slate-300">{pct}%</span>
        </div>
        <div className="mt-1.5 flex gap-px">
          {Array.from({ length: SEGMENTS }).map((_, i) => (
            <div
              key={i}
              className={`h-2 flex-1 ${i < filled ? dir.bar : 'bg-white/[0.06]'}`}
            />
          ))}
        </div>
      </div>

      {stance.reasoning && (
        <p className="mt-4 text-sm leading-relaxed text-slate-300">{stance.reasoning}</p>
      )}

      {stance.evidence?.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-600">Evidence</div>
          {stance.evidence.map((e, i) => (
            <div key={i} className="border-l border-white/10 bg-black/30 p-3 pl-4">
              <div className="flex gap-2">
                <Quote className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-600" />
                <p className="text-sm italic text-slate-200">{e.quote}</p>
              </div>
              {e.postUrl && (
                <a
                  href={e.postUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block font-mono text-[11px] uppercase tracking-wider text-accent hover:underline"
                >
                  View source →
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
