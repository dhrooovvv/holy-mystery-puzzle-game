import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
export default defineConfig({
  root: 'src/client',
  plugins: [react()],
  resolve: {alias: process.env.REDDIT_BUILD === '1' ? {} : {'@devvit/web/client': resolve('src/client/platform-local.ts')}},
  build: {outDir: '../../dist/client', emptyOutDir: true, rollupOptions: {input: {game:resolve('src/client/index.html'), splash:resolve('src/client/splash.html')}}},
  server: {host:'127.0.0.1', port:Number(process.env.LOCAL_WEB_PORT || 5173), proxy:{'/api':`http://127.0.0.1:${process.env.LOCAL_API_PORT || 3001}`}}
});
