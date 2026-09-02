import { createServer } from 'vite';
import react from '@vitejs/plugin-react';

const server = await createServer({
  configFile: false,
  root: '.',
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    host: true,
  },
});

await server.listen();
server.printUrls();
