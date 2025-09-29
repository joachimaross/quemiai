'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var framer_motion_1 = require("framer-motion");
var Logo = function () {
    return (<framer_motion_1.motion.div className="flex items-center justify-center w-48 h-48" animate={{
            scale: [1, 1.05, 1],
            rotate: [0, 5, 0],
        }} transition={{
            duration: 5,
            ease: 'easeInOut',
            repeat: Infinity,
            repeatType: 'mirror',
        }}>
      <svg width="100%" height="100%" viewBox="0 0 192 192" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_0_8px_rgba(0,102,255,0.8)]">
        <defs>
          <linearGradient id="zeeky-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#0066FF' }}/>
            <stop offset="100%" style={{ stopColor: '#FF00CC' }}/>
          </linearGradient>
        </defs>
        <framer_motion_1.motion.path d="M48 48 L96 48 L96 96 L144 96 L144 144 L96 144 L96 96 L48 96 Z" fill="url(#zeeky-gradient)" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{
            duration: 2,
            ease: 'easeInOut',
        }}/>
        <framer_motion_1.motion.path d="M96 96 L144 96 L144 48 L96 48 Z" fill="rgba(255, 255, 255, 0.1)" whileHover={{ fill: 'rgba(255, 255, 255, 0.3)' }}/>
      </svg>
    </framer_motion_1.motion.div>);
};
exports.default = Logo;
