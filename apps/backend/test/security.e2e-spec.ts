import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import helmet from 'helmet';
import { AppModule } from './../src/app.module';
import { env } from './../src/config/env.config';

// AR-044 — D-044.1 (helmet), D-044.2 (@nestjs/throttler), D-044.3 (CORS scoped to configured origins).

describe('Security middleware (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(helmet());
    app.enableCors({ origin: env.CORS_ALLOWED_ORIGINS });
    app.setGlobalPrefix('v1');
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('D-044.1 — helmet', () => {
    it('applies security headers to every response, from a single global registration', async () => {
      const res = await request(app.getHttpServer()).get('/v1/health');

      expect(res.headers['x-content-type-options']).toBe('nosniff');
      expect(res.headers['x-dns-prefetch-control']).toBe('off');
      // helmet removes the Express default fingerprinting header.
      expect(res.headers['x-powered-by']).toBeUndefined();
    });
  });

  describe('D-044.3 — CORS scoped to configured origins', () => {
    const [allowedOrigin] = env.CORS_ALLOWED_ORIGINS;

    it('reflects the Access-Control-Allow-Origin header for an authorized origin', async () => {
      const res = await request(app.getHttpServer())
        .get('/v1/health')
        .set('Origin', allowedOrigin);

      expect(res.headers['access-control-allow-origin']).toBe(allowedOrigin);
    });

    it('omits the Access-Control-Allow-Origin header for an unauthorized origin', async () => {
      const res = await request(app.getHttpServer())
        .get('/v1/health')
        .set('Origin', 'http://evil.example.com');

      expect(res.headers['access-control-allow-origin']).toBeUndefined();
    });
  });

  describe('D-044.2 — global rate limiting', () => {
    it('returns 429 once the configured limit is exceeded within the window', async () => {
      const totalRequests = env.THROTTLE_LIMIT + 5;
      const statusCodes: number[] = [];
      for (let i = 0; i < totalRequests; i++) {
        const res = await request(app.getHttpServer()).get('/v1/health');
        statusCodes.push(res.status);
      }

      expect(statusCodes).toContain(429);
    }, 30000);
  });
});
