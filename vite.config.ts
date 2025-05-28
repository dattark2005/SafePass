import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // Removed 'lucide-react' from exclude to allow pre-bundling
  },
  server: { // Proxy should be inside 'server'
    proxy: {
      "/v0/b/safepass-599eb.firebasestorage.app": {
        target: "https://firebasestorage.googleapis.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/v0\/b\/safepass-599eb.firebasestorage.app/, ""),
        secure: true, // Ensure HTTPS requests are validated
      },
    },
  },
});