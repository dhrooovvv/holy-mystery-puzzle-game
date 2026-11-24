// Official React template build integration: bundles both server and client.
import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {devvit} from '@devvit/start/vite';
export default defineConfig({plugins:[react(),devvit()]});
