import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // The third parameter '' loads all env vars regardless of prefix (needed for API_KEY).
  // We explicitly check process.cwd() exists, or fallback for safety.
  const cwd = typeof process !== 'undefined' && (process as any).cwd ? (process as any).cwd() : '.';
  const env = loadEnv(mode, cwd, '');

  return {
    plugins: [react()],
    define: {
      // This ensures your code using process.env.API_KEY works in the browser
      // It prioritizes the env var loaded by Vite, then falls back to the system process.env (Netlify CI)
      'process.env.API_KEY': JSON.stringify(env.API_KEY || process.env.API_KEY),
    },
    server: {
      port: 3000,
    }
  };
});