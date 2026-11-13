import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'acid-lime': '#cff060',
        'deep-green': '#1c5f27',
        'muted-olive': '#3d7a37',
        'muted-sage': '#9ec74b',
        background: 'var(--background)',
        surface: 'var(--surface)',
        'surface-subtle': 'var(--surface-subtle)',
        border: 'var(--border)',
        foreground: 'var(--foreground)',
        muted: 'var(--muted)',
        accent: 'var(--accent)',
        'primary-action-bg': 'var(--primary-action-bg)',
        'primary-action-fg': 'var(--primary-action-fg)',
      },
    },
  },
  plugins: [],
};

export default config;

