import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
const WS_URL = process.env.VITE_WS_URL;

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: WS_URL,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
