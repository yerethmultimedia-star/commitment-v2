import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { ProblemDetailsExceptionFilter } from './../src/filters/problem-details-exception.filter';

interface RegisterResponse {
  commitmentId: string;
  version: number;
}

interface ProblemDetailsResponse {
  title: string;
  status: number;
  detail: string;
}

describe('CommitmentsController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('v1');
    app.useGlobalFilters(new ProblemDetailsExceptionFilter());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should successfully register a commitment and then behave idempotently on duplicate request', async () => {
    const payload = {
      id: '018f6b5c-42e1-7000-8000-999999999999',
      identityId: '018f6b5c-42e1-7000-8000-111111111111',
      title: 'Practice Clean Architecture',
      description: 'Model layers clearly and decouple framework adapter layers',
    };

    // 1. First register
    const res1 = await request(app.getHttpServer())
      .post('/v1/commitments')
      .send(payload)
      .expect(200);

    const body1 = res1.body as RegisterResponse;
    expect(body1).toEqual({ commitmentId: payload.id, version: 1 });

    // 2. Second register (idempotent response — different title is ignored)
    const res2 = await request(app.getHttpServer())
      .post('/v1/commitments')
      .send({ ...payload, title: 'Different Title' })
      .expect(200);

    const body2 = res2.body as RegisterResponse;
    expect(body2).toEqual({ commitmentId: payload.id, version: 1 });
  });

  it('should return 400 if request contains invalid UUID format', async () => {
    const invalidPayload = {
      id: 'invalid-id-format',
      identityId: '018f6b5c-42e1-7000-8000-111111111111',
      title: 'Valid Title',
    };

    const res = await request(app.getHttpServer())
      .post('/v1/commitments')
      .send(invalidPayload)
      .expect(400);

    const body = res.body as ProblemDetailsResponse;
    expect(body.title).toBe('BadRequestException');
  });

  it('should return 400 if title is empty or missing', async () => {
    const invalidPayload = {
      id: '018f6b5c-42e1-7000-8000-999999999999',
      identityId: '018f6b5c-42e1-7000-8000-111111111111',
      title: '',
    };

    const res = await request(app.getHttpServer())
      .post('/v1/commitments')
      .send(invalidPayload)
      .expect(400);

    const body = res.body as ProblemDetailsResponse;
    expect(body.title).toBe('BadRequestException');
  });

  it('should return 400 if title exceeds maximum allowed length', async () => {
    const invalidPayload = {
      id: '018f6b5c-42e1-7000-8000-999999999999',
      identityId: '018f6b5c-42e1-7000-8000-111111111111',
      title: 'a'.repeat(200), // domain max is 150 chars
    };

    const res = await request(app.getHttpServer())
      .post('/v1/commitments')
      .send(invalidPayload)
      .expect(400);

    const body = res.body as ProblemDetailsResponse;
    expect(body.title).toBe('Bad Request');
  });
});
