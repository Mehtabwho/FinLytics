import { motion } from 'framer-motion';

export const PageTransition = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};

export const FadeIn = ({ children, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay }}
    >
      {children}
    </motion.div>
  );
};

export const SlideIn = ({ children, direction = 'left', delay = 0 }) => {
  const initialX = direction === 'left' ? -20 : direction === 'right' ? 20 : 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: initialX }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      {children}
    </motion.div>
  );
};

export const StaggerContainer = ({ children, delay = 0.1 }) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: delay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
