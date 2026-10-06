import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight, 
  Layers, 
  MapPin, 
  Video, 
  Camera, 
  FileText, 
  CreditCard, 
  Smartphone, 
  Compass, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  BrainCircuit,
  Fingerprint
} from 'lucide-react';

const evidenceSources = [
  { icon: MapPin, name: 'GPS & GeoLife .plt', weight: '1.00', desc: 'Ingests latitude, longitude, and altitude trajectory telemetry points.' },
  { icon: Video, name: 'CCTV & Surveillance', weight: '1.00', desc: 'Parses frames, camera timestamps, and spatial video recordings.' },
  { icon: Camera, name: 'Photographic EXIF', weight: '0.90', desc: 'Extracts DateTimeOriginal, camera make/model, and embedded GPS coordinates.' },
  { icon: FileText, name: 'Tesseract OCR Text', weight: '0.85', desc: 'Extracts stamped dates, camera IDs, and visible overlay text from images.' },
  { icon: CreditCard, name: 'Bank & Transactions', weight: '0.80', desc: 'Correlates ATM withdrawals, POS terminal locations, and payment logs.' },
  { icon: Smartphone, name: 'Call Records & CDR', weight: '0.75', desc: 'Correlates cell tower pings, phone call logs, and SMS transmission times.' },
];

export default function ArchitecturePage() {
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100">
      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 text-xs text-slate-400 hover:text-white transition">
            <ArrowLeft size={14} /> Back to Home
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/simulator" className="text-xs text-slate-400 hover:text-cyan-300 transition">
              Interactive Simulator
            </Link>
            <Link to="/viva-guide" className="text-xs text-slate-400 hover:text-cyan-300 transition">
              Viva Defense Guide
            </Link>
            <Link to="/dashboard" className="rounded-lg bg-cyan-500 hover:bg-cyan-400 px-3.5 py-1.5 text-xs font-semibold text-slate-950 transition">
              Launch Workspace
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-16">
        {/* Title */}
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Technical Specification</span>
          <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-white tracking-tight">
            System Architecture & Correlation Pipeline
          </h1>
          <p className="mt-3 text-sm text-slate-400 max-w-3xl leading-relaxed">
            The multi-stage forensic pipeline ingests unstructured and structured digital evidence, calculates cryptographic integrity hashes, normalizes timeline events, and applies deterministic alibi correlation.
          </p>
        </div>

        {/* 5-Stage Pipeline */}
        <section className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers size={18} className="text-cyan-400" /> The 5-Stage Pipeline
            </h2>
            <p className="text-xs text-slate-400 mt-1">End-to-end data lifecycle from file ingestion to forensic reporting.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              {
                step: '01',
                title: 'Alibi Intake',
                desc: 'Investigator registers suspect claim: Claimed Location, GPS coordinates, and exact Start/End time window.',
                badge: 'Time Window'
              },
              {
                step: '02',
                title: 'Evidence Ingestion',
                desc: 'Artifacts ingested (GeoLife .plt, CSV, EXIF photos, Video). SHA-256 computed immediately to guarantee chain of custody.',
                badge: 'SHA-256'
              },
              {
                step: '03',
                title: 'Metadata Extraction',
                desc: 'Pillow reads EXIF; OpenCV extracts frames; Tesseract OCR extracts timestamps; GeoLife telemetry parsed.',
                badge: 'Normalization'
              },
              {
                step: '04',
                title: 'Correlation Engine',
                desc: 'Temporal window overlap filter + 150m Haversine geographic distance tolerance + evidence source weighting.',
                badge: 'Haversine 150m'
              },
              {
                step: '05',
                title: 'Verdict & Report',
                desc: 'Formula: Score = (W_Match / W_Rel) × 100. Categorized as Supported, Inconclusive, or Contradicted.',
                badge: 'Court Report'
              }
            ].map(stage => (
              <div 
                key={stage.step}
                className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xl font-bold text-cyan-400/50">{stage.step}</span>
                    <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[9px] font-mono text-slate-300">{stage.badge}</span>
                  </div>
                  <h3 className="mt-3 font-semibold text-white text-xs sm:text-sm">{stage.title}</h3>
                  <p className="mt-2 text-xs text-slate-400 leading-relaxed">{stage.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Mathematical Formulation */}
        <section className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Compass size={18} className="text-cyan-400" /> Algorithmic Formulation & Haversine Distance
            </h2>
            <p className="text-xs text-slate-400 mt-1">Mathematical standards ensuring explainability for forensic scrutiny.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-5">
              <span className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider">Consistency Score</span>
              <p className="mt-2 font-mono text-base text-white font-bold">
                Score = (W_Match / W_Rel) × 100
              </p>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Matches are summed with modality weights. If no evidence overlaps the window, W_Rel = 0, returning an <strong>Inconclusive</strong> verdict rather than an incorrect contradiction.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-5">
              <span className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider">Haversine Geographic Radius</span>
              <p className="mt-2 font-mono text-base text-white font-bold">
                Tolerance: ≤ 150 Meters
              </p>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Applies great-circle distance between claimed GPS coordinates and timestamped evidence fixes, accommodating standard civilian GPS drift and urban canyoning.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-5">
              <span className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider">Temporal Windowing</span>
              <p className="mt-2 font-mono text-base text-white font-bold">
                T_start ≤ T_evidence ≤ T_end
              </p>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Only evidence falling inside the claimed alibi interval is evaluated for match/contradiction. External evidence is classified <strong>Neutral</strong>.
              </p>
            </div>
          </div>
        </section>

        {/* Evidence Sources & Weights */}
        <section className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck size={18} className="text-cyan-400" /> Modality Weights & Certainty Scale
            </h2>
            <p className="text-xs text-slate-400 mt-1">Calibrated weights reflecting evidentiary reliability.</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {evidenceSources.map(source => {
              const Icon = source.icon;
              return (
                <div key={source.name} className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="rounded-lg bg-slate-800 p-2 text-cyan-400">
                        <Icon size={16} />
                      </div>
                      <span className="font-semibold text-white text-xs sm:text-sm">{source.name}</span>
                    </div>
                    <span className="font-mono text-xs font-semibold text-cyan-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      W = {source.weight}
                    </span>
                  </div>
                  <p className="mt-2.5 text-xs text-slate-400 leading-relaxed">{source.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Bottom Navigation */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
          <Link to="/viva-guide" className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5">
            Next: Read Academic Defense FAQ <ArrowRight size={14} />
          </Link>
          <Link to="/dashboard" className="rounded-lg bg-cyan-500 hover:bg-cyan-400 px-4 py-2 text-xs font-semibold text-slate-950 transition">
            Open Investigation Console →
          </Link>
        </div>
      </main>
    </div>
  );
}
