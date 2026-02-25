import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "va-primary": "#E91E63",
        "va-primary-dark": "#C2185B",
        "va-background": "hsl(var(--va-surface))",
        "va-surface": "hsl(var(--va-surface))",
        "va-card": "hsl(var(--va-card))",
        "va-text": "hsl(var(--va-text))",
        "va-border": "hsl(var(--va-border))",
        "va-dark": "#1A1A1A",
        "va-dark-soft": "#2D2D2D",
        // Legacy support
        primary: "#E91E63",
        "va-black": "#1A1A1A",
        "va-off-white": "hsl(35, 25%, 98%)",
      },
      fontFamily: {
        display: ["Raleway", "sans-serif"],
        sans: ["Raleway", "Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        'va-sm': '4px',
        'va-md': '8px',
        'va-lg': '12px',
        'va-xl': '16px',
        'va-2xl': '24px',
        'va-3xl': '32px',
        'va-full': '9999px',
      },
      spacing: {
        'va-btn-sm-y': '0.5rem',   // 8px
        'va-btn-sm-x': '1rem',     // 16px
        'va-btn-md-y': '0.75rem',  // 12px
        'va-btn-md-x': '1.5rem',   // 24px
        'va-btn-lg-y': '1.25rem',  // 20px
        'va-btn-lg-x': '2rem',     // 32px
      },
      animation: {
        'liquid-gradient': 'liquid 120s linear infinite',
        'shimmer': 'shimmer 3s linear infinite',
      },
      keyframes: {
        liquid: {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      transitionTimingFunction: {
        'va-bezier': 'cubic-bezier(0.165, 0.84, 0.44, 1)',
      }
    },
  },
  plugins: [],
};
export default config;
