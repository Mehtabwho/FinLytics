import { motion } from 'framer-motion';

export const Skeleton = ({ width = '100%', height = '20px', className = '', count = 1 }) => {
  return (
    <>
      {Array(count)
        .fill(0)
        .map((_, i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.6, 0.9, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{ width, height }}
            className={`bg-slate-200 rounded-lg ${className} ${i > 0 ? 'mt-3' : ''}`}
          />
        ))}
    </>
  );
};

export const SkeletonCard = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
      <Skeleton height="24px" width="40%" />
      <Skeleton height="32px" width="60%" />
      <Skeleton height="16px" width="80%" />
    </div>
  );
};

export const SkeletonTable = ({ rows = 5 }) => {
  return (
    <div className="space-y-2">
      {Array(rows)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-4 flex items-center gap-4">
            <Skeleton width="100%" height="20px" />
          </div>
        ))}
    </div>
  );
};

export default Skeleton;
