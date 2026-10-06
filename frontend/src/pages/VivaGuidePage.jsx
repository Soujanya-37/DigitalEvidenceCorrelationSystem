import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  HelpCircle, 
  ShieldCheck, 
  BrainCircuit, 
  AlertTriangle,
  FileText
} from 'lucide-react';

const VIVA_QA = [
  {
    q: "What is an alibi in digital forensics?",
    a: "An alibi is an assertion that a subject was physically elsewhere during the timeframe of an incident. Our system tests whether ingested digital footprints (GPS, photos, surveillance, banking) corroborate or contradict this claim."
  },
  {
    q: "Why is the word 'Correlation' significant in this project?",
    a: "The system does not merely store evidence in isolation. It correlates each evidence timestamp and spatial coordinate against the claimed alibi window and location, applying Haversine spherical distance calculations and weighted certainty scoring."
  },
  {
    q: "What is the AI / ML layer doing?",
    a: "The core verification is deterministic (Haversine distance + time overlap + source weighting) to guarantee legal explainability and auditability in court. An integrated machine learning model (Random Forest / Calibrated Classifier) provides assistive pattern scoring on feature vectors without overriding explainable rules."
  },
  {
    q: "Why is 'INCONCLUSIVE' a critical design requirement?",
    a: "In forensic jurisprudence, lack of evidence is not evidence of absence. If no digital records exist during the claimed alibi window, the system must not fabricate an alibi location or declare contradiction. It returns 'Inconclusive', preserving forensic neutrality."
  },
  {
    q: "How is chain of custody guaranteed?",
    a: "Every evidence asset uploaded has its SHA-256 cryptographic checksum computed immediately upon receipt before any processing. The raw file is stored unaltered, and the SHA-256 hash is embedded into all investigation reports."
  },
  {
    q: "What datasets are used for validation?",
    a: "The system is validated against Microsoft GeoLife GPS trajectory logs (.plt), synthetic multi-modal CCTV and banking incident datasets, EXIF metadata from field photographs, and OCR extraction overlays."
  }
];

export default function VivaGuidePage() {
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
              System Architecture
            </Link>
            <Link to="/simulator" className="text-xs text-slate-400 hover:text-cyan-300 transition">
              Interactive Simulator
            </Link>
            <Link to="/dashboard" className="rounded-lg bg-cyan-500 hover:bg-cyan-400 px-3.5 py-1.5 text-xs font-semibold text-slate-950 transition">
              Launch Workspace
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-12">
        {/* Title */}
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Academic Defense</span>
          <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Engineering Project Viva Guide & FAQs
          </h1>
          <p className="mt-3 text-sm text-slate-400 leading-relaxed">
            Key theoretical foundations, examiner questions, and design rationale prepared for major capstone project evaluation and external viva voce.
          </p>
        </div>

        {/* 30-Second Elevator Pitch */}
        <section className="rounded-xl border border-cyan-500/30 bg-cyan-950/15 p-6">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-300">
            <BrainCircuit size={15} /> 30-Second Viva Pitch
          </div>
          <p className="mt-3 text-sm text-slate-200 leading-relaxed">
            "In modern criminal and cyber investigations, suspects provide an alibi while investigators seize multi-gigabyte forensic evidence—GPS trajectories, CCTV footage, photographs, and transaction logs. Manually aligning these timestamps across heterogeneous sources is slow and error-prone. Our system automates this through cryptographic intake, timeline reconstruction, and explainable 150m Haversine correlation, generating court-admissible decision support with full mathematical transparency."
          </p>
        </section>

        {/* Core Viva Q&A */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <HelpCircle size={18} className="text-cyan-400" /> Anticipated Examiner Questions
          </h2>

          <div className="grid gap-4">
            {VIVA_QA.map((item, i) => (
              <div key={i} className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-5 space-y-2.5">
                <h3 className="font-semibold text-white text-sm flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-cyan-400 shrink-0 mt-0.5" />
                  <span>{item.q}</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 pl-6 leading-relaxed">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom Navigation */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
          <Link to="/architecture" className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5">
            <ArrowLeft size={14} /> View Architecture Details
          </Link>
          <Link to="/dashboard" className="rounded-lg bg-cyan-500 hover:bg-cyan-400 px-4 py-2 text-xs font-semibold text-slate-950 transition">
            Launch Workspace Console →
          </Link>
        </div>
      </main>
    </div>
  );
}
