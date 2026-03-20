import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'figma-gray': '#666666',
        'figma-bg': '#e8e8e8',
        'figma-white-semi': 'rgba(255, 255, 255, 0.5)',
      },
      fontFamily: {
        sans: ['Bricolage Grotesque', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
