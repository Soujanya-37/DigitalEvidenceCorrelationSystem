import { useState } from 'react';
import { X, ShieldCheck, Cpu, Layers, GitMerge, FileText, CheckCircle2, AlertTriangle, ArrowRight, HelpCircle } from 'lucide-react';

export default function ProjectExplainerModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('problem');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-2 text-cyan-300">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Digital Evidence Correlation System for Alibi Verification</h2>
              <p className="text-xs text-slate-400">Forensic Decision-Support Architecture & Problem Statement Guide</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="rounded-xl border border-slate-800 p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-800/80 bg-slate-900/50 px-6 py-2.5 text-xs font-semibold">
          {[
            { id: 'problem', label: '1. Problem Statement' },
            { id: 'workflow', label: '2. 5-Stage Pipeline' },
            { id: 'algorithms', label: '3. Algorithms & Scoring' },
            { id: 'academic', label: '4. Academic Defense FAQ' },
            { id: 'pitch', label: '5. 30-Sec Viva Pitch' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-xl px-3 py-1.5 transition-all ${
                activeTab === tab.id
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="min-h-0 flex-1 overflow-y-auto p-6 text-sm text-slate-300 space-y-5">
          {activeTab === 'problem' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4">
                <h4 className="font-bold text-cyan-300 text-base">The Core Problem: Unstructured Digital Evidence vs Claimed Alibi</h4>
                <p className="mt-2 text-slate-300 leading-relaxed">
                  In modern criminal investigations, a suspect often states an <strong>alibi</strong>:
                  <span className="block mt-1 font-mono text-cyan-300 bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                    "I was at Location A between 08:00 PM and 10:00 PM."
                  </span>
                  Investigators have disparate, unstructured digital footprints: GPS telemetry, CCTV video, photographs, bank transactions, and phone logs.
                  Manually cross-comparing hundreds or thousands of timestamps and locations across separate files is error-prone, slow, and lacks mathematical rigor.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                  <h5 className="font-semibold text-white flex items-center gap-2">
                    <FileText size={16} className="text-cyan-400" /> What this system IS:
                  </h5>
                  <ul className="mt-2 space-y-1.5 text-xs text-slate-400 list-disc list-inside">
                    <li>An automated <strong>cross-source correlation engine</strong>.</li>
                    <li>Extracts metadata (EXIF, OCR, GPS coordinates, timestamps).</li>
                    <li>Reconstructs a single normalized chronological timeline.</li>
                    <li>Computes geographical distance using the <strong>Haversine formula</strong>.</li>
                    <li>Produces an explainable <strong>Evidence Consistency Score</strong>.</li>
                  </ul>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                  <h5 className="font-semibold text-white flex items-center gap-2">
                    <AlertTriangle size={16} className="text-amber-400" /> What this system is NOT:
                  </h5>
                  <ul className="mt-2 space-y-1.5 text-xs text-slate-400 list-disc list-inside">
                    <li>Not a simple file storage or dump drive.</li>
                    <li>Not a generic black-box chatbot.</li>
                    <li>Does <strong>not</strong> declare legal guilt or innocence.</li>
                    <li>Does not assume an absent file means a contradiction.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'workflow' && (
            <div className="space-y-4">
              <h4 className="font-bold text-white text-base">The 5-Stage Forensic Pipeline</h4>
              
              <div className="relative border-l-2 border-cyan-500/40 ml-4 pl-6 space-y-5">
                <div className="relative">
                  <div className="absolute -left-[31px] top-0 h-4 w-4 rounded-full bg-cyan-400 border-4 border-slate-950" />
                  <h5 className="font-bold text-white text-sm">Stage 1: Case Creation & Alibi Claim Intake</h5>
                  <p className="text-xs text-slate-400 mt-1">Investigator registers the case, suspect identity, claimed location (with optional GPS coordinates), and exact time window.</p>
                </div>

                <div className="relative">
                  <div className="absolute -left-[31px] top-0 h-4 w-4 rounded-full bg-cyan-400 border-4 border-slate-950" />
                  <h5 className="font-bold text-white text-sm">Stage 2: Multi-Source Evidence Ingestion & Cryptographic Hashing</h5>
                  <p className="text-xs text-slate-400 mt-1">Files uploaded (Images, Videos, GeoLife .plt, CSV, JSON). SHA-256 hash computed immediately to guarantee integrity and chain of custody.</p>
                </div>

                <div className="relative">
                  <div className="absolute -left-[31px] top-0 h-4 w-4 rounded-full bg-cyan-400 border-4 border-slate-950" />
                  <h5 className="font-bold text-white text-sm">Stage 3: Automated Processing & Timeline Normalization</h5>
                  <p className="text-xs text-slate-400 mt-1">Pillow extracts EXIF DateTime & GPS; OpenCV parses video metadata; Tesseract OCR reads on-screen timestamps; parsers extract trajectory coordinates. Stored as normalized Timeline Events.</p>
                </div>

                <div className="relative">
                  <div className="absolute -left-[31px] top-0 h-4 w-4 rounded-full bg-cyan-400 border-4 border-slate-950" />
                  <h5 className="font-bold text-white text-sm">Stage 4: Dual-Engine Correlation (Time + Haversine + Weights)</h5>
                  <p className="text-xs text-slate-400 mt-1">Time window overlap filter + 150m Haversine geographic distance tolerance + evidence source weighting (GPS=1.0, CCTV=1.0, Video=0.9, Bank=0.8, etc.).</p>
                </div>

                <div className="relative">
                  <div className="absolute -left-[31px] top-0 h-4 w-4 rounded-full bg-cyan-400 border-4 border-slate-950" />
                  <h5 className="font-bold text-white text-sm">Stage 5: Explainable Verdict & Forensic Report</h5>
                  <p className="text-xs text-slate-400 mt-1">Score computed as (Weighted Matching / Weighted Relevant) × 100. Categorized into SUPPORTED (80-100%), INCONCLUSIVE (41-79%), or CONTRADICTED (0-40%).</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'algorithms' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                <h4 className="font-bold text-cyan-300">The Primary Correlation Engine: Haversine + Source Weights</h4>
                <div className="mt-3 font-mono text-xs bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-300 space-y-2">
                  <p><strong>Haversine Formula:</strong> Calculates great-circle distance between Claimed GPS (lat1, lon1) and Evidence GPS (lat2, lon2).</p>
                  <p><strong>Tolerance Threshold:</strong> distance ≤ 150 meters → <span className="text-emerald-400 font-bold">MATCH</span></p>
                  <p><strong>Contradiction Threshold:</strong> inside time window & distance &gt; 150 meters → <span className="text-rose-400 font-bold">CONFLICT</span></p>
                  <p><strong>Outside Window:</strong> event_timestamp &lt; start OR &gt; end → <span className="text-slate-400 font-bold">NEUTRAL</span></p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                <h4 className="font-bold text-white text-sm">Configured Evidence Source Weights</h4>
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800"><span>GPS Telemetry:</span> <strong className="text-cyan-300">1.00</strong></div>
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800"><span>CCTV Video:</span> <strong className="text-cyan-300">1.00</strong></div>
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800"><span>Photo / EXIF:</span> <strong className="text-cyan-300">0.90</strong></div>
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800"><span>Device Logs:</span> <strong className="text-cyan-300">0.85</strong></div>
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800"><span>Bank / ATM:</span> <strong className="text-cyan-300">0.80</strong></div>
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800"><span>Phone Logs:</span> <strong className="text-cyan-300">0.75</strong></div>
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800"><span>SMS Messages:</span> <strong className="text-cyan-300">0.65</strong></div>
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800"><span>Email Records:</span> <strong className="text-cyan-300">0.60</strong></div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'academic' && (
            <div className="space-y-3">
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                <p className="font-semibold text-cyan-300 text-xs">Q: What is the AI actually doing?</p>
                <p className="mt-1 text-xs text-slate-300">
                  "The core correlation engine is deterministic because forensic decision support must be 100% explainable and verifiable in court. We integrated a Random Forest ML model as an assistive decision-support layer trained on feature vectors (source type, time window overlap, coordinates presence, and Haversine distance)."
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                <p className="font-semibold text-cyan-300 text-xs">Q: Why is the 'INCONCLUSIVE' verdict so important?</p>
                <p className="mt-1 text-xs text-slate-300">
                  "If an investigator has no evidence during the claimed time, the system cannot conclude the person was absent. <strong>No evidence ≠ contradiction</strong>. The system logically reports 'INCONCLUSIVE' instead of generating false contradictions."
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                <p className="font-semibold text-cyan-300 text-xs">Q: Does SHA-256 prove evidence is authentic?</p>
                <p className="mt-1 text-xs text-slate-300">
                  "No. SHA-256 establishes <strong>cryptographic file integrity</strong> (proving the file has not been altered since ingestion). It does not by itself prove external legal authenticity."
                </p>
              </div>
            </div>
          )}

          {activeTab === 'pitch' && (
            <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-5 space-y-3">
              <h4 className="font-bold text-white text-base flex items-center gap-2">
                <CheckCircle2 size={18} className="text-cyan-400" /> The 30-Second Viva Elevator Pitch
              </h4>
              <p className="text-xs text-slate-200 leading-relaxed font-serif italic text-sm border-l-2 border-cyan-400 pl-4 py-1">
                "Suppose a person claims an alibi: they were at Location A between 09:00 and 10:00. An investigator collects GPS logs, CCTV footage, photographs, and bank records. Manually cross-referencing all these unstructured files is tedious and prone to mistakes.<br/><br/>
                Our system ingests these disparate digital evidence files, computes SHA-256 hashes for chain of custody, extracts timestamps and coordinates via EXIF, OpenCV, and OCR, reconstructs a unified timeline, and correlates events against the claimed alibi using time filtering, Haversine geographic distance (150m tolerance), and evidence source weighting. It provides an explainable Supported, Contradicted, or Inconclusive score and exports a formal forensic report."
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 bg-slate-900/60 px-6 py-3 text-xs text-slate-400">
          <span>Digital Forensics • Computer Science & Design Engineering</span>
          <button 
            onClick={onClose}
            className="rounded-xl bg-cyan-500 px-4 py-2 font-semibold text-slate-950 hover:bg-cyan-400"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}
