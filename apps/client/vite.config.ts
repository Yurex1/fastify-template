import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
const WS_URL = process.env.VITE_WS_URL;
const PORT = process.env.VITE_API_PORT;

export default defineConfig({
  plugins: [react()],
  preview: {
    allowedHosts: ['fastify-templateclient-production.up.railway.app'],
  },
  server: {
    port: Number(PORT) || 3000,
    proxy: {
      '/api': {
        target: WS_URL,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
