import {defineConfig} from 'vite';
import reactRefresh from '@vitejs/plugin-react-refresh';
import dotEnv from 'dotenv';

// https://vitejs.dev/config/

export default ({mode}: any) => {
  dotEnv.config({path: `./.env`});
  return defineConfig({
    plugins: [reactRefresh()],
    define: {
      processEnv: process.env,
    },
  });
}
