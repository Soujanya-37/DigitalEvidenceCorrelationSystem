import { useState, useMemo } from 'react';
import { ShieldCheck, MapPin, Clock, AlertTriangle, CheckCircle2, XCircle, Info, RefreshCw, Layers } from 'lucide-react';

const SAMPLE_EVIDENCE = [
  {
    id: 'ev-1',
    source: 'GPS Log',
    type: 'gps',
    time: '09:15 AM',
    timestamp: '2026-10-05T09:15:00',
    location: 'Location A (Central Plaza)',
    distanceM: 18,
    weight: 1.0,
    inWindow: true,
    initialEnabled: true,
    details: 'GeoLife trajectory track point within 18m of claimed coordinate.',
  },
  {
    id: 'ev-2',
    source: 'Photo EXIF',
    type: 'image',
    time: '09:30 AM',
    timestamp: '2026-10-05T09:30:00',
    location: 'Location A (Central Plaza)',
    distanceM: 0,
    weight: 0.9,
    inWindow: true,
    initialEnabled: true,
    details: 'EXIF DateTimeOriginal & embedded GPS coordinates exact match.',
  },
  {
    id: 'ev-3',
    source: 'CCTV Camera',
    type: 'cctv',
    time: '09:45 AM',
    timestamp: '2026-10-05T09:45:00',
    location: 'Location B (North Highway)',
    distanceM: 4800,
    weight: 1.0,
    inWindow: true,
    initialEnabled: false,
    details: 'Automated License Plate / Face OCR recorded 4.8 km away during alibi window.',
  },
  {
    id: 'ev-4',
    source: 'ATM Bank Transaction',
    type: 'transaction',
    time: '10:30 AM',
    timestamp: '2026-10-05T10:30:00',
    location: 'Location B (North Highway)',
    distanceM: 4800,
    weight: 0.8,
    inWindow: false,
    initialEnabled: true,
    details: 'Outside claimed alibi window (09:00 - 10:00). Neutral forensic status.',
  },
];

export default function AlibiSimulator() {
  const [enabledIds, setEnabledIds] = useState(() => 
    SAMPLE_EVIDENCE.filter(e => e.initialEnabled).map(e => e.id)
  );

  const toggleEvidence = (id) => {
    setEnabledIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const resetAll = () => {
    setEnabledIds(SAMPLE_EVIDENCE.map(e => e.id));
  };

  // Algorithmic correlation logic matching backend
  const stats = useMemo(() => {
    const active = SAMPLE_EVIDENCE.filter(e => enabledIds.includes(e.id));
    
    let weightedMatching = 0;
    let weightedRelevant = 0;
    let matchedCount = 0;
    let conflictingCount = 0;
    let neutralCount = 0;

    active.forEach(item => {
      if (!item.inWindow) {
        neutralCount++;
        return;
      }

      // Check distance tolerance (150m)
      const isMatch = item.distanceM <= 150;
      weightedRelevant += item.weight;

      if (isMatch) {
        weightedMatching += item.weight;
        matchedCount++;
      } else {
        conflictingCount++;
      }
    });

    let score = null;
    let verdict = 'INCONCLUSIVE';
    let verdictReason = 'No relevant evidence within the claimed alibi time window.';

    if (weightedRelevant > 0) {
      score = Math.round((weightedMatching / weightedRelevant) * 1000) / 10;

      if (score >= 80) {
        verdict = 'SUPPORTED';
        verdictReason = 'Evidence strongly supports the subject was at the claimed location during the time window.';
      } else if (score <= 40) {
        verdict = 'CONTRADICTED';
        verdictReason = 'Significant conflicting digital evidence places the subject elsewhere during the alibi window.';
      } else {
        verdict = 'INCONCLUSIVE';
        verdictReason = 'Mixed signals or partial evidence requires investigative review.';
      }
    }

    return {
      activeCount: active.length,
      matchedCount,
      conflictingCount,
      neutralCount,
      weightedMatching: Math.round(weightedMatching * 100) / 100,
      weightedRelevant: Math.round(weightedRelevant * 100) / 100,
      score,
      verdict,
      verdictReason,
    };
  }, [enabledIds]);

  return (
    <div className="rounded-3xl border border-cyan-500/30 bg-slate-950/85 p-6 shadow-2xl backdrop-blur-md">
      {/* Simulator Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300">
            <Layers size={13} /> Interactive Correlation Engine
          </div>
          <h3 className="mt-2 text-xl font-bold text-white">Live Alibi Verification Simulation</h3>
          <p className="text-xs text-slate-400">Toggle sample evidence to see how the mathematical correlation formula determines the verdict.</p>
        </div>
        <button 
          onClick={resetAll}
          className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 hover:border-cyan-400/40 hover:text-white"
        >
          <RefreshCw size={13} /> Reset All
        </button>
      </div>

      {/* Claimed Alibi Banner */}
      <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">Claimed Subject Alibi</p>
        <div className="mt-2 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-2.5">
            <span className="text-[11px] text-slate-500">Subject</span>
            <p className="text-sm font-semibold text-white">Research Subject 208</p>
          </div>
          <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-2.5">
            <span className="text-[11px] text-slate-500 flex items-center gap-1"><MapPin size={11} className="text-cyan-400"/> Claimed Location</span>
            <p className="text-sm font-semibold text-white">Location A (Central Plaza)</p>
          </div>
          <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-2.5">
            <span className="text-[11px] text-slate-500 flex items-center gap-1"><Clock size={11} className="text-cyan-400"/> Alibi Window</span>
            <p className="text-sm font-semibold text-white">09:00 AM – 10:00 AM</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Evidence Toggles vs Realtime Score Output */}
      <div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Left: Evidence Toggles */}
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Available Digital Evidence Items</p>
          {SAMPLE_EVIDENCE.map(item => {
            const isEnabled = enabledIds.includes(item.id);
            const isMatch = item.inWindow && item.distanceM <= 150;
            const isConflict = item.inWindow && item.distanceM > 150;
            const isNeutral = !item.inWindow;

            return (
              <div 
                key={item.id}
                onClick={() => toggleEvidence(item.id)}
                className={`cursor-pointer rounded-2xl border p-3.5 transition-all ${
                  isEnabled 
                    ? 'border-slate-700 bg-slate-900/80 shadow-md' 
                    : 'border-slate-800/40 bg-slate-950/40 opacity-45'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      checked={isEnabled} 
                      onChange={() => {}} 
                      className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500/20"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-white">{item.source}</span>
                        <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-cyan-300 font-mono">{item.time}</span>
                        <span className="text-[10px] text-slate-500">Weight: {item.weight.toFixed(2)}</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-400">{item.location} • {item.distanceM === 0 ? 'Exact match' : `${item.distanceM}m away`}</p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  {isEnabled && (
                    <div className="shrink-0 text-right">
                      {isMatch && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">
                          <CheckCircle2 size={12} /> MATCH
                        </span>
                      )}
                      {isConflict && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-rose-300">
                          <XCircle size={12} /> CONFLICT
                        </span>
                      )}
                      {isNeutral && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-slate-600/30 bg-slate-800/40 px-2.5 py-0.5 text-[11px] font-medium text-slate-400">
                          <Info size={12} /> NEUTRAL
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <p className="mt-2 text-[11px] text-slate-500 pl-7">{item.details}</p>
              </div>
            );
          })}
        </div>

        {/* Right: Engine Calculation & Verdict */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/90 p-5">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-3">
              <span>CORRELATION ENGINE OUTPUT</span>
              <span className="font-mono text-[10px] text-cyan-400">HAVERSINE ≤ 150M</span>
            </div>

            {/* Score & Verdict Display */}
            <div className="mt-5 text-center">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Evidence Consistency Score</span>
              <div className="mt-2 flex items-baseline justify-center gap-1">
                <span className="text-5xl font-extrabold tracking-tight text-white font-mono">
                  {stats.score !== null ? `${stats.score}%` : 'N/A'}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-800">
                <div 
                  className={`h-full transition-all duration-300 ${
                    stats.verdict === 'SUPPORTED' 
                      ? 'bg-gradient-to-r from-emerald-500 to-cyan-400' 
                      : stats.verdict === 'CONTRADICTED' 
                      ? 'bg-gradient-to-r from-rose-500 to-amber-500' 
                      : 'bg-gradient-to-r from-amber-400 to-cyan-400'
                  }`}
                  style={{ width: `${stats.score !== null ? Math.max(0, Math.min(100, stats.score)) : 0}%` }}
                />
              </div>

              {/* Verdict Badge */}
              <div className="mt-4 flex justify-center">
                <div className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 font-bold tracking-wide text-sm ${
                  stats.verdict === 'SUPPORTED' 
                    ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300' 
                    : stats.verdict === 'CONTRADICTED' 
                    ? 'border-rose-500/40 bg-rose-500/15 text-rose-300' 
                    : 'border-amber-500/40 bg-amber-500/15 text-amber-300'
                }`}>
                  {stats.verdict === 'SUPPORTED' && <CheckCircle2 size={16} />}
                  {stats.verdict === 'CONTRADICTED' && <XCircle size={16} />}
                  {stats.verdict === 'INCONCLUSIVE' && <AlertTriangle size={16} />}
                  {stats.verdict}
                </div>
              </div>
              <p className="mt-2 text-xs text-slate-400">{stats.verdictReason}</p>
            </div>

            {/* Formula Explanation */}
            <div className="mt-6 rounded-xl border border-slate-800/80 bg-slate-950/70 p-3.5 text-left">
              <p className="text-[10px] font-mono uppercase tracking-wider text-cyan-300">Deterministic Formula</p>
              <p className="mt-1 font-mono text-[11px] text-slate-300">
                Score = (Matching {stats.weightedMatching} / Relevant {stats.weightedRelevant}) × 100
              </p>
              <div className="mt-2 grid grid-cols-3 gap-1 text-[10px] text-slate-400 border-t border-slate-800/80 pt-2">
                <span>Matched: <strong className="text-emerald-400">{stats.matchedCount}</strong></span>
                <span>Conflict: <strong className="text-rose-400">{stats.conflictingCount}</strong></span>
                <span>Neutral: <strong className="text-slate-300">{stats.neutralCount}</strong></span>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-lg bg-cyan-950/30 border border-cyan-800/30 p-2.5 text-[10px] text-cyan-300">
            <span className="font-semibold">Academic Principle:</span> No evidence ≠ contradiction. Outside-window evidence is neutral and does not penalize the alibi claim.
          </div>
        </div>
      </div>
    </div>
  );
}
