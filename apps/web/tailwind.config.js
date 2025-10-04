"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var config = {
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
            },
            spacing: {
                '128': '32rem',
                '144': '36rem',
            },
        },
    },
    plugins: [],
};
exports.default = config;
