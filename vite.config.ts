import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: {
    port: 5173,
    strictPort: true,
    host: true,
    watch: {
      ignored: [
        '**/config/**',
        '**/themes/**',
        '**/*.db',
        '**/*.db-journal',
        '**/*.db-wal',
        '**/*.db-shm',
        '**/logs/**',
        '**/roms/**',
        '**/emulators/**',
        '**/dist-portable/**',
        '**/src-tauri/**',
      ],
    },
  },
});
