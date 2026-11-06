import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'node_modules'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // Le code existant s'appuie largement sur `any` pour les reponses
      // Supabase et les payloads de paiement. La regle reste signalee, mais
      // en avertissement : elle ne doit pas bloquer la chaine CI.
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrors: 'none',
        },
      ],
    },
  },
  {
    // Les Edge Functions Supabase tournent sur Deno : leurs globales
    // (Deno, fetch, console) et leurs imports specifiques ne passent pas
    // par la configuration navigateur.
    files: ['supabase/functions/**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.browser,
        Deno: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
      // Les Edge Functions Deno importent des modules distants par URL
      // (https://deno.land/..., https://esm.sh/...). Aucun outil TypeScript
      // local ne peut resoudre ces imports : les directives de suppression
      // sont donc necessaires et propres a ces fichiers.
      '@typescript-eslint/ban-ts-comment': 'off',
    },
  },
);
