import { defineConfig, loadEnv } from 'vite';
import path from 'node:path';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig(({ mode }) => {
  // Load the project's root `.env` file regardless of where the command is run.
  // This allows environment variables defined at the repository root to be
  // available when running scripts from subdirectories like `web/`.
  const env = loadEnv(mode, path.resolve(__dirname, '..'), '');

  // Create an object with only the keys we want to expose
  const exposedEnvs = {
    API_KEY: env.API_KEY,
    MSAL_CLIENT_ID: env.MSAL_CLIENT_ID,
    MSAL_TENANT_ID: env.MSAL_TENANT_ID,
  };

  return {
    define: {
      // Expose a sanitized version of `process.env` to your client-side code.
      // `JSON.stringify` is crucial here.
      'process.env': JSON.stringify(exposedEnvs)
    },
    plugins: [
      viteStaticCopy({
        targets: [
          { src: 'src/pages', dest: 'src' },
          { src: 'src/modals', dest: 'src' }
        ]
      })
    ],
    build: {
      target: 'esnext' // Ensure modern JS syntax is supported
    }
  }
});