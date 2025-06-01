import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  root: __dirname,
  plugins: [react()],
  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'app'),
      // Force using local React Router v7 instead of workspace v6
      'react-router-dom': path.resolve(__dirname, 'node_modules/react-router'),
    },
    dedupe: ['react-router'],
  },
  optimizeDeps: {
    include: ['react-router', 'react-router > @remix-run/router'],
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(
      process.env.NODE_ENV || 'development'
    ),
  },
});
