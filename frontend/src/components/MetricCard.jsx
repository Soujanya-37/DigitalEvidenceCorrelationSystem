export default function MetricCard({ title, value, detail, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 transition hover:border-slate-700/80">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</span>
        {Icon && (
          <div className="rounded-lg bg-slate-800/80 p-2 text-cyan-400">
            <Icon size={16} />
          </div>
        )}
      </div>
      <p className="mt-3 font-mono text-3xl font-bold text-white tracking-tight">{value}</p>
      {detail && <p className="mt-1.5 text-xs text-slate-400">{detail}</p>}
    </div>
  );
}
