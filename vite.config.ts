import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Permite el uso de process.env.API_KEY en el código cliente tras el build
    'process.env': {
      API_KEY: process.env.API_KEY
    }
  }
});