import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import monacoEditorPlugin from 'vite-plugin-monaco-editor';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@common': path.resolve(__dirname, './src/common'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pc-random': path.resolve(__dirname, './src/common/random'),
      '@rendering': path.resolve(__dirname, './src/common/rendering'),
      '@wildcard-browser': path.resolve(
        __dirname,
        './external/wildcard-browser',
      ),
    },
  },
  plugins: [
    react(),
    monacoEditorPlugin.default({ languageWorkers: [], customWorkers: [] }),
  ],
  base: '/prompt-crafter/',
});
