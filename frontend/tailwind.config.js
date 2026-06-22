export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        accent: '#4d7cfe',
        ink: {
          950: '#07080a',
          900: '#0b0d11',
          800: '#11141a',
        },
      },
      fontFamily: {
        mono: ['ui-monospace', 'SF Mono', 'JetBrains Mono', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
};
