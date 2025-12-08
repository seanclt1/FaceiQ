import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'dist/',
        '*.config.ts',
        '*.config.js',
        'vitest.setup.ts',
        '**/*.d.ts',
        '**/*.types.ts',
        '**/index.ts',
        '**/index.tsx',
        'components/ResultsScreen.example.tsx', // Example file, not production code
      ],
      thresholds: {
        // Global thresholds - aim for 80%+ overall
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
        // Per-file thresholds for critical modules
        perFile: true,
      },
      // Custom thresholds for specific high-priority files
      lines: {
        'services/*.ts': 90,
        'hooks/*.ts': 85,
        'components/*.tsx': 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
