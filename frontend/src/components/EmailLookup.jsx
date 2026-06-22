import React, { useState } from 'react';
import { Mail, Loader2, ShieldAlert, CheckCircle2, KeyRound, Phone } from 'lucide-react';
import * as api from '../api';

export default function EmailLookup() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  async function run(e) {
    e?.preventDefault();
    const v = email.trim();
    if (!v) return;
    setError(null);
    setResult(null);
    setBusy(true);
    try {
      setResult(await api.emailLookup(v));
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
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="TARGET EMAIL — e.g. someone@example.com"
            className="w-full border border-white/10 bg-black/30 py-3 pl-10 pr-3 font-mono text-sm text-white placeholder-slate-600 outline-none transition focus:border-accent/60"
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="flex items-center gap-2 border border-accent/40 bg-accent/15 px-5 font-mono text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-accent/25 disabled:opacity-40"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Look up'}
        </button>
      </form>

      <p className="mt-2 font-mono text-xs text-slate-500">
        Checks which platforms have an account registered to this email. Does not notify the owner.
      </p>

      {error && (
        <div className="mt-5 flex items-start gap-2 border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {busy && (
        <div className="mt-8 flex items-center gap-3 border border-white/10 bg-white/[0.02] p-4 font-mono text-xs text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin text-accent" />
          PROBING ~120 SITES FOR REGISTERED ACCOUNTS…
        </div>
      )}

      {result && (
        <section className="mt-8">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent/80">RESULT</span>
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500">
              Registered on {result.registeredCount} of {result.checked} sites
            </span>
            <span className="h-px flex-1 bg-white/10" />
          </div>
          <p className="mt-2 font-mono text-xs text-slate-500">
            {result.rateLimited > 0 &&
              `${result.rateLimited} sites rate-limited / inconclusive. `}
            Absence of a result is not proof of absence.
          </p>

          {result.registeredCount === 0 ? (
            <p className="mt-4 text-sm text-slate-400">No registered accounts confirmed.</p>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {result.registered.map((r) => (
                <div key={r.platform} className="border border-emerald-500/20 bg-emerald-500/[0.05] p-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span className="text-sm font-medium capitalize text-white">{r.platform}</span>
                    {r.domain && <span className="font-mono text-[10px] text-slate-500">{r.domain}</span>}
                  </div>
                  {(r.recoveryHint || r.phoneHint) && (
                    <div className="mt-2 space-y-1 font-mono text-xs text-slate-300">
                      {r.recoveryHint && (
                        <div className="flex items-center gap-1.5">
                          <KeyRound className="h-3 w-3 text-amber-400" /> Recovery: {r.recoveryHint}
                        </div>
                      )}
                      {r.phoneHint && (
                        <div className="flex items-center gap-1.5">
                          <Phone className="h-3 w-3 text-amber-400" /> Phone: {r.phoneHint}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          <p className="border-t border-white/5 pt-4 mt-6 text-center font-mono text-[10px] uppercase tracking-wider text-slate-600">
            Public registration signals only · verify before acting
          </p>
        </section>
      )}
    </div>
  );
}
