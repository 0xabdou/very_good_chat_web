import {defineConfig} from 'vite';
import reactRefresh from '@vitejs/plugin-react-refresh';

// https://vitejs.dev/config/

const viteEnv = {} as ImportMetaEnv;
Object.keys(process.env).forEach((key) => {
  if (key.startsWith(`VITE_`)) {
    viteEnv[key] = process.env[key];
  }
});

export default defineConfig({
  plugins: [reactRefresh()],
  define: {viteEnv}
});
