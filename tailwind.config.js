module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],  theme: {
    extend: {
      fontFamily: {
        alexandria: ['"Alexandria"', 'sans-serif'],
      },
    },
  },
  plugins: [
    function ({ addBase }) {
      addBase({
        '*, ::before, ::after': {
          boxSizing: 'border-box',
        },
      });
    },
  ],
};
