// Logo: Animated SVG logo for Jacameno
'use client';
import { motion } from 'framer-motion';

/**
 * Logo component for Jacameno, animated SVG with neon gradient.
 */
const Logo = () => {
  return (
    <motion.div
      className="flex items-center justify-center w-48 h-48"
      animate={{ scale: [1, 1.05, 1], rotate: [0, 5, 0] }}
      transition={{ duration: 5, ease: 'easeInOut', repeat: Infinity, repeatType: 'mirror' }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 192 192"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-[0_0_8px_rgba(0,102,255,0.8)]"
        aria-label="Jacameno Logo"
      >
        <defs>
          <linearGradient id="zeeky-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0066FF" />
            <stop offset="100%" stopColor="#FF00CC" />
          </linearGradient>
        </defs>
        <motion.path
          d="M48 48 L96 48 L96 96 L144 96 L144 144 L96 144 L96 96 L48 96 Z"
          fill="url(#zeeky-gradient)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, ease: 'easeInOut' }}
        />
      </svg>
    </motion.div>
  );
};
export default Logo;
