import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import monacoEditorPlugin from 'vite-plugin-monaco-editor';

export default defineConfig({
  plugins: [
    react(),
    monacoEditorPlugin.default({ languageWorkers: [], customWorkers: [] }),
  ],
  base: '/prompt-crafter/',
});
