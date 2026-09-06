// ESLint ki "flat config" file (naya format — ek array of config-objects,
// purane .eslintrc.json ki jagah). `npm run lint` isi file ko use karta hai.
// Yeh sirf code-quality/bug-patterns check karta hai — TYPE errors ke liye
// alag se `tsc -b` chalta hai (dono independent tools hain).

import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  // "dist" (build output) folder ko kabhi lint mat karo — wo generated code hai.
  { ignores: ['dist'] },
  {
    // Do rule-sets base ke roop mein extend kar rahe hain:
    // 1. js.configs.recommended -> plain JS ki common mistakes (unused vars waghera)
    // 2. tseslint.configs.recommended -> TypeScript-specific recommended rules
    extends: [js.configs.recommended, ...tseslint.configs.recommended],

    // Yeh poora config sirf .ts aur .tsx files pe apply hoga.
    files: ['**/*.{ts,tsx}'],

    languageOptions: {
      // Modern JS syntax (2020) samjhne ke liye parser ko batana.
      ecmaVersion: 2020,
      // Browser globals allow karo (window, document, localStorage, etc.)
      // taaki ESLint inhe "undefined variable" na samjhe.
      globals: globals.browser,
    },

    // Extra plugins jo React Hooks aur Vite ke Fast Refresh ke liye
    // specific rules provide karte hain.
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },

    rules: {
      // React Hooks ke rules (useEffect/useCallback dependency array sahi
      // hai ya nahi, hooks sirf top-level pe call ho rahe hain ya nahi) —
      // yeh wahi cheezein pakadta hai jo types nahi pakad sakte
      // (dekho TYPESCRIPT_GUIDE.md section 11 — dependency array wala point).
      ...reactHooks.configs.recommended.rules,

      // Vite ka Fast Refresh (HMR) sirf tab sahi kaam karta hai jab ek file
      // sirf React components export kare. Agar koi file component ke sath
      // koi aur cheez (helper function, constant) bhi export kare to yeh
      // rule sirf "warn" karta hai (error nahi) — allowConstantExport: true
      // ka matlab hai, ek constant export bhi saath mein karna theek hai.
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
)
