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
      whileHover={hover ? { y: -4 } : {}}
      onClick={onClick}
      className={`bg-white rounded-2xl border border-slate-100/50 shadow-sm hover:shadow-lg transition-all duration-300 ${className} ${
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
    primary: 'text-blue-600 bg-blue-50',
    secondary: 'text-green-600 bg-green-50',
    red: 'text-red-600 bg-red-50',
    purple: 'text-purple-600 bg-purple-50',
    amber: 'text-amber-600 bg-amber-50',
  };

  return (
    <Card delay={delay} className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
          <p className="text-3xl font-bold text-slate-900">{value}</p>
          {trend && (
            <p className={`text-xs font-medium mt-2 ${
              trend > 0 ? 'text-green-600' : 'text-red-600'
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
