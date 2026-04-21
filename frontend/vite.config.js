import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Proxy all /api requests to your backend during development
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        // Optional: rewrite path if needed (not needed in your case)
        // rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  build: {
    outDir: '../public_html/.builds/source/repository/frontend/dist',
    emptyOutDir: true,
    sourcemap: false, // Set to true if you need debugging in production
  }
});