import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'functions/**',
    'attendance_jne_martapura_backend/**',
  ]),
  {
    rules: {
      // Data Firestore masuk sebagai `any` di banyak query helper; melarang
      // total tidak praktis untuk basis kode ini. Turunkan ke warning agar
      // tetap terlihat tanpa memblokir `npm run lint`/build. Tech-debt:
      // ketik bertahap dengan tipe domain.
      '@typescript-eslint/no-explicit-any': 'warn',
      // Tanda kutip literal di teks JSX — kosmetik, React tetap render benar.
      'react/no-unescaped-entities': 'warn',
      // Advisory React Compiler (Next 16/React 19). Bukan bug fatal; app jalan.
      // Tetap warning (bukan off) supaya bisa diperbaiki bertahap.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
    },
  },
]);

export default eslintConfig;
