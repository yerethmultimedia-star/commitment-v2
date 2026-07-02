import { z } from 'zod';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Cargar variables de entorno de archivos locales si existen
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().default(4000),
  REDIS_URL: z.string().url().default('redis://localhost:6379'),
  SUPABASE_URL: z
    .string()
    .url()
    .default('https://placeholder-project.supabase.co'),
  SUPABASE_ANON_KEY: z.string().min(1).default('placeholder-anon-key'),
  OTEL_SERVICE_NAME: z.string().default('backend-service'),
  OTEL_EXPORTER_OTLP_ENDPOINT: z
    .string()
    .url()
    .default('http://localhost:4318'),
});

export type Env = z.infer<typeof envSchema>;

let _env: Env;

export function validateEnv(): Env {
  if (_env) return _env;

  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error('❌ Error de validación en variables de entorno:');

    console.error(JSON.stringify(parsed.error.format(), null, 2));
    process.exit(1);
  }
  _env = parsed.data;
  return _env;
}

export const env = validateEnv();
