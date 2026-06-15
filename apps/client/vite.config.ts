import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env variables manually to ensure they are available
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    // server: {
    //   host: '0.0.0.0',
    //   port: Number(env.VITE_API_PORT) || 3000,
    //   // Add the allowedHosts here to cover both dev and preview
    //   allowedHosts: env.VITE_ALLOWED_HOSTS ? env.VITE_ALLOWED_HOSTS.split(',') : true,
    //   proxy: {
    //     '/api': {
    //       target: env.VITE_WS_URL,
    //       changeOrigin: true,
    //       rewrite: (path) => path.replace(/^\/api/, ''),
    //     },
    //   },
    // },
    server: {
      host: '0.0.0.0',
      port: Number(env.VITE_API_PORT) || 3000,
      allowedHosts: env.VITE_ALLOWED_HOSTS ? env.VITE_ALLOWED_HOSTS.split(',') : true,
      proxy: {
        '/api': {
          target: 'http://localhost:9000',
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  };
});
