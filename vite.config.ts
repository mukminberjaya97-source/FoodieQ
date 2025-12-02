import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1600, // Increased to 1600kB to accommodate large libraries like jsPDF
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-ui': ['lucide-react', 'react-hot-toast'],
          'vendor-charts': ['recharts'],
          'vendor-pdf': ['jspdf'],
          'vendor-supabase': ['@supabase/supabase-js']
        }
      }
    }
  }
});