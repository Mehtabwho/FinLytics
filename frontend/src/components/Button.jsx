import { motion } from 'framer-motion';

export const Button = ({ 
  children, 
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  isLoading = false,
  ...props 
}) => {
  const variants = {
    primary: 'bg-primary hover:bg-primary-light text-white shadow-lg shadow-blue-900/20',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-900',
    danger: 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20',
    ghost: 'text-slate-600 hover:bg-slate-100',
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
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      {...props}
    >
      {isLoading ? 'Processing...' : children}
    </motion.button>
  );
};

export default Button;
