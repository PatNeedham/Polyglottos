import { defineConfig } from 'vite';
import { reactRouter } from '@react-router/dev/vite';
import path from 'path';

export default defineConfig({
  root: __dirname,
  plugins: [reactRouter()],
  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'app'),
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(
      process.env.NODE_ENV || 'development'
    ),
  },
});
