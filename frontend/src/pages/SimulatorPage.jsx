import { Link } from 'react-router-dom';
import { ArrowLeft, BrainCircuit } from 'lucide-react';
import AlibiSimulator from '../components/AlibiSimulator';

export default function SimulatorPage() {
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100">
      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 text-xs text-slate-400 hover:text-white transition">
            <ArrowLeft size={14} /> Back to Home
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/architecture" className="text-xs text-slate-400 hover:text-cyan-300 transition">
              Architecture
            </Link>
            <Link to="/viva-guide" className="text-xs text-slate-400 hover:text-cyan-300 transition">
              Viva Guide
            </Link>
            <Link to="/dashboard" className="rounded-lg bg-cyan-500 hover:bg-cyan-400 px-3.5 py-1.5 text-xs font-semibold text-slate-950 transition">
              Launch Workspace
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Interactive Evaluation Tool</span>
          <h1 className="mt-2 text-3xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <BrainCircuit size={28} className="text-cyan-400" /> Alibi Correlation Simulator
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            Test how the dual-engine correlation calculates consistency in real time. Toggle evidence items below to evaluate the 150m Haversine distance, temporal window overlap, and modality source weighting.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/30 p-4 sm:p-6">
          <AlibiSimulator />
        </div>
      </main>
    </div>
  );
}
