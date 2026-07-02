# @commitment/config

Shared configurations for TypeScript, ESLint, and Prettier in the Commitment v2 monorepo.

## Usage

Extend the base TS configuration in your `tsconfig.json`:

```json
{
  "extends": "@commitment/config/tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```
