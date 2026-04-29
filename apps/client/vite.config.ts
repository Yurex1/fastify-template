import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
const WS_URL = process.env.VITE_WS_URL;
const PORT = process.env.VITE_API_PORT;
const ALLOWED_HOSTS = process.env.VITE_ALLOWED_HOSTS;

export default defineConfig({
  plugins: [react()],
<<<<<<< HEAD
  preview: {
    allowedHosts: ALLOWED_HOSTS?.split(',') || [],
  },
=======
>>>>>>> d921383 ([TEMPLATE]: chat consts (refactor))
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
