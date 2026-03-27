import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8788',
        changeOrigin: true,
      },
    },
  },
  define: {
    'import.meta.env.VITE_EMAIL_DOMAIN': JSON.stringify(process.env.VITE_EMAIL_DOMAIN || 'kushal.qzz.io'),
  },
});
