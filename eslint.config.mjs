import { defineConfig } from 'eslint/config';
import prettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

export default defineConfig(
    {
        ignores: ['**/node_modules/**', '**/dist/**', '**/dev-dist/**'],
    },
    prettier,
    ...tseslint.configs.recommended,
    {
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            ...tseslint.configs.stylistic.find((c) => c.rules)?.rules,
            '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
            '@typescript-eslint/no-empty-object-type': 'error',
            curly: 'error',
            'no-nested-ternary': 'error',
            '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
            '@typescript-eslint/array-type': ['error', { default: 'generic' }],
            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/consistent-type-exports': 'error',
            '@typescript-eslint/consistent-type-imports': 'error',
            '@typescript-eslint/no-import-type-side-effects': 'error',
            'arrow-body-style': ['error', 'as-needed'],
            camelcase: ['error', { ignoreDestructuring: true }],
            eqeqeq: 'error',
            'no-console': ['error', { allow: ['warn', 'error', 'debug'] }],
            'no-shadow-restricted-names': 'error',
            'no-useless-catch': 'error',
            'no-var': 'error',
            'padding-line-between-statements': ['warn', { blankLine: 'always', prev: '*', next: 'return' }],
            'prefer-const': 'error',
        },
    }
);
