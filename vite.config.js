import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      include: ['**/*.jsx', '**/*.js'], // Explicitly allow JSX in .js files
      babel: {
        plugins: ['@babel/plugin-transform-react-jsx'], // Ensure Babel JSX transform
      },
    }),
  ],
  server: {
    host: 'localhost', // or '127.0.0.1'
    port: 5173,       // Try this or another port
  },
});