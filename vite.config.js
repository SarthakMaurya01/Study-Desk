import { defineConfig } from 'vite';

export default defineConfig({
  appType: 'spa',
  build: {
    target: 'es2022',
    manifest: 'precache-manifest.json',
    sourcemap: false,
  },
});
