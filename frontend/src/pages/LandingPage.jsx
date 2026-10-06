import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Fingerprint, 
  Layers, 
  Compass, 
  ShieldCheck, 
  BrainCircuit,
  FileSearch,
  ExternalLink
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col justify-between selection:bg-cyan-500/25 selection:text-white">
      {/* Minimal Top Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/40 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Fingerprint size={20} />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 block">Forensic Core</span>
              <span className="text-sm font-semibold text-white tracking-tight">Evidence Correlate</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs text-slate-300">
            <Link to="/architecture" className="hover:text-cyan-300 transition">
              Architecture & Pipeline
            </Link>
            <Link to="/simulator" className="hover:text-cyan-300 transition">
              Alibi Simulator
            </Link>
            <Link to="/viva-guide" className="hover:text-cyan-300 transition">
              Viva Defense Guide
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/login" className="text-xs text-slate-300 hover:text-white transition px-2 py-1">
              Sign In
            </Link>
            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 px-3.5 py-1.5 text-xs font-semibold text-slate-950 transition shadow-sm"
            >
              Launch Console <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20 flex-1 flex flex-col justify-center">
        <div className="text-center max-w-3xl mx-auto">
          {/* Engineering Project Tag */}
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-3.5 py-1 text-xs text-slate-300 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
            <span className="font-medium">Engineering Final Year Capstone</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">Digital Forensics</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.2]">
            Digital Evidence Correlation System for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300">
              Alibi Verification
            </span>
          </h1>

          <p className="mt-5 text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
            An automated decision-support platform designed to ingest multi-source digital footprints, reconstruct unified spatio-temporal timelines, and mathematically verify claimed subject alibis.
          </p>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 px-5 py-2.5 text-xs font-semibold text-slate-950 transition shadow-sm"
            >
              Access Investigation Console <ArrowRight size={14} />
            </Link>
            <Link
              to="/architecture"
              className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-5 py-2.5 text-xs font-medium text-slate-200 hover:text-white hover:border-slate-700 transition"
            >
              <Layers size={14} className="text-cyan-400" /> View System Architecture
            </Link>
          </div>
        </div>

        {/* 3 Core Engineering Pillars */}
        <div className="mt-16 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-5">
            <div className="h-8 w-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-3">
              <FileSearch size={16} />
            </div>
            <h2 className="text-sm font-semibold text-white">01. Multi-Modal Ingestion</h2>
            <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
              Ingests GeoLife GPS logs, CCTV footage, EXIF photos, and bank records with SHA-256 chain of custody verification.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-5">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
              <Compass size={16} />
            </div>
            <h2 className="text-sm font-semibold text-white">02. Spatio-Temporal Correlation</h2>
            <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
              Applies a 150m Haversine distance tolerance and temporal overlap windowing to reconstruct a unified timeline.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-5">
            <div className="h-8 w-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3">
              <BrainCircuit size={16} />
            </div>
            <h2 className="text-sm font-semibold text-white">03. Explainable Verdicts</h2>
            <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
              Deterministic scoring formula yields court-admissible Supported, Contradicted, or Inconclusive decisions.
            </p>
          </div>
        </div>

        {/* Quick Capstone Specs Banner */}
        <div className="mt-8 rounded-xl border border-slate-800/60 bg-slate-950/40 p-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs text-slate-400">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Algorithm</span>
              <span className="text-slate-200 font-medium">Haversine (150m)</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Integrity</span>
              <span className="text-slate-200 font-medium">SHA-256 Hashes</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Datasets</span>
              <span className="text-slate-200 font-medium">GeoLife GPS & Multi-Modal</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Backend</span>
              <span className="text-slate-200 font-medium">FastAPI & PostgreSQL</span>
            </div>
          </div>
        </div>

        {/* Quick Links to Separated Sections */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
          <Link to="/simulator" className="hover:text-cyan-300 transition flex items-center gap-1">
            Try Interactive Simulator →
          </Link>
          <span className="text-slate-700">•</span>
          <Link to="/viva-guide" className="hover:text-cyan-300 transition flex items-center gap-1">
            Read Viva Defense Guide →
          </Link>
          <span className="text-slate-700">•</span>
          <Link to="/cases" className="hover:text-cyan-300 transition flex items-center gap-1">
            Browse Active Cases →
          </Link>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <p className="font-medium text-slate-400">
          Digital Evidence Correlation System for Alibi Verification
        </p>
        <p className="mt-1 text-[11px] text-slate-500">
          Final Year Engineering Project • Computer Science & Engineering
        </p>
      </footer>
    </div>
  );
}