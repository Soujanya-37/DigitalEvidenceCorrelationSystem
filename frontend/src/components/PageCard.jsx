import { motion } from 'framer-motion';

export default function PageCard({ title, description, children, action }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 6 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.2 }} 
      className="forensic-card p-6"
    >
      {(title || description || action) && (
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">{title}</h2>
            {description && <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-3xl">{description}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </motion.div>
  );
}
