/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        'iron-bg':      '#0D0D0D',
        'iron-surface': '#1A1A1A',
        'iron-surface2':'#222222',
        'iron-border':  '#2A2A2A',
        'iron-border2': '#3A3A3A',
        'iron-accent':  '#D4FF00',
        'iron-text':    '#F0F0F0',
        'iron-muted':   '#888888',
        'iron-faint':   '#555555',
        'iron-danger':  '#FF4444',
        'iron-success': '#44FF88',
        'iron-warning': '#FF8C00',
        'iron-eaten':   '#1A2A0A',
      },
      fontFamily: {
        display: ['Barlow Condensed', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        iron: '4px',
      },
      boxShadow: {
        'accent-glow': '0 0 12px rgba(212,255,0,0.3)',
        'accent-ring': '0 0 0 2px rgba(212,255,0,0.15)',
      },
    },
  },
}
