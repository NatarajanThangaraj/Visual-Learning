import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Catalyst hosts the compiled `client/` folder. `base` controls the URL prefix
// for built assets; default '/' serves at the domain root. If Catalyst mounts
// the client under a subpath, rebuild with e.g. VITE_BASE_PATH=/app/ — the
// router basename follows automatically (see src/main.jsx).
export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
