import { defineConfig } from 'vite';

// Relative base so the built folder works from any host or sub-path (Netlify Drop, GitHub Pages).
export default defineConfig({
  base: './',
});
