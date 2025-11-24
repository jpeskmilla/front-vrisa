import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    strictPort: true,
    port: 5173, // Puerto interno de Vite
    watch: {
      usePolling: true,
      interval: 100,
      binaryInterval: 300,
      ignored: ['**/node_modules/**', '**/.git/**'], 
    },
    hmr: {
      host: 'localhost',
      clientPort: 8088,  // Puerto externo mapeado
      protocol: 'ws'
    }
  }
});

