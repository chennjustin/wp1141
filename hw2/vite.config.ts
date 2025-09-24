import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// 使用 process.cwd() 避免 ESM 下 __dirname 與 node:url 相依
const r = (p: string) => path.resolve(process.cwd(), p);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@components': r('src/components'),
      '@game': r('src/game'),
      '@hooks': r('src/hooks'),
      '@utils': r('src/utils'),
    },
  },
});


