import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig(({ command }) => {
  // Dev server configuration
  if (command === 'serve') {
    return {
      root: 'dev',
      plugins: [
        react(),
        tailwindcss({
          config: resolve(__dirname, 'tailwind.config.js'),
        }),
      ],
      resolve: {
        alias: {
          '../src': resolve(__dirname, 'src'),
        },
      },
    }
  }

  // Library build configuration
  return {
    plugins: [
      react(),
      tailwindcss(),
      dts({
        include: ['src'],
        rollupTypes: true,
      }),
    ],
    build: {
      cssCodeSplit: false,
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        name: 'WorkflowDebugPanel',
        formats: ['es', 'cjs'],
        fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`,
      },
      rollupOptions: {
        external: ['react', 'react-dom', 'react/jsx-runtime'],
        output: {
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM',
            'react/jsx-runtime': 'jsxRuntime',
          },
        },
      },
    },
  }
})
