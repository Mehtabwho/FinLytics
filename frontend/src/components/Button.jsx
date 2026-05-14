import { motion } from 'framer-motion';

export const Button = ({ 
  children, 
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  isLoading = false,
  fullWidth = false, // Added fullWidth prop
  ...props 
}) => {
  const variants = {
    primary: 'gradient-btn text-white shadow-lg shadow-cyan-500/20',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700',
    danger: 'bg-red-500/80 hover:bg-red-500 text-white shadow-lg shadow-red-500/20',
    ghost: 'text-slate-300 hover:bg-slate-800 hover:text-white border border-transparent hover:border-slate-700',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      disabled={disabled || isLoading}
      className={`
        font-medium rounded-xl transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}
      `}
      {...props} // Spread remaining props
    >
      {isLoading ? 'Processing...' : children}
    </motion.button>
  );
};

export default Button;
