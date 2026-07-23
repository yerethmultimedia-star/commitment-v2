// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      'no-console': 'error',
      "prettier/prettier": ["error", { endOfLine: "auto" }],
    },
  },
  {
    // AR-054/D-054.1: no Queue/Worker registered by the application counts as
    // a complete BullMQ integration without an explicit error handler.
    // BullModule.registerQueue() and @InjectQueue() are restricted to the
    // 2 files that already own that responsibility (see AR-054/ANALISIS.md
    // Fase 4A) — this is a Level 2 static restriction, not an absolute
    // structural guarantee (DiscoveryService was evaluated and deliberately
    // not adopted, see AR-054/ANALISIS.md).
    files: ['src/**/*.ts'],
    ignores: [
      'src/app.module.ts',
      'src/notifications/notifications.module.ts',
      'src/notifications/infrastructure/bullmq-execution-engine.ts',
    ],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@nestjs/bullmq',
              importNames: ['BullModule'],
              message:
                'Register BullMQ queues only in notifications.module.ts (the designated single integration point — see AR-054/ANALISIS.md, D-054.1). A new queue/worker registered elsewhere would bypass its mandatory error handler.',
            },
            {
              name: '@nestjs/bullmq',
              importNames: ['InjectQueue'],
              message:
                'Inject BullMQ queues only in bullmq-execution-engine.ts (the designated single integration point — see AR-054/ANALISIS.md, D-054.1), which already registers the mandatory error handler.',
            },
          ],
        },
      ],
    },
  },
);
