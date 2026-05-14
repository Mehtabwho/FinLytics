import { motion } from 'framer-motion';

export const Card = ({ 
  children, 
  className = '', 
  hover = true,
  delay = 0,
  onClick = null
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={hover ? { y: -4, boxShadow: '0 20px 40px -5px rgba(15, 23, 42, 0.6)' } : {}}
      onClick={onClick}
      className={`glass-card rounded-2xl transition-all duration-300 ${className} ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      {children}
    </motion.div>
  );
};

export const StatCard = ({ 
  label, 
  value, 
  icon: Icon, 
  trend = null,
  color = 'primary',
  delay = 0 
}) => {
  const colorMap = {
    primary: 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/20',
    secondary: 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20',
    red: 'text-red-400 bg-red-500/10 border border-red-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border border-purple-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border border-amber-500/20',
  };

  return (
    <Card delay={delay} className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400 mb-1">{label}</p>
          <p className="text-3xl font-bold text-slate-100">{value}</p>
          {trend && (
            <p className={`text-xs font-medium mt-2 flex items-center gap-1 ${
              trend > 0 ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last month
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${colorMap[color]}`}>
            <Icon size={24} />
          </div>
        )}
      </div>
    </Card>
  );
};

export default Card;
