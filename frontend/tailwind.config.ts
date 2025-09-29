import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'zeeky-blue': '#0066FF',
        'neon-fuchsia': '#FF00CC',
        'deep-space': '#0A0A18',
        'bg': '#0A0A18',
        'primary': '#00FFD0',
        'secondary': '#1A1A2E',
        'accent': '#FF00CC',
      },
      backgroundImage: {
        'neon-gradient': 'linear-gradient(90deg, #00FFD0 0%, #0066FF 50%, #FF00CC 100%)',
      },
      animation: {
        'neon-flicker': 'neon-flicker 1.5s infinite alternate',
      },
      keyframes: {
        'neon-flicker': {
          '0%, 100%': { filter: 'brightness(1.1)' },
          '50%': { filter: 'brightness(1.5) drop-shadow(0 0 8px #00FFD0) drop-shadow(0 0 16px #FF00CC)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
