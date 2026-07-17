import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { ProblemDetailsExceptionFilter } from './../src/filters/problem-details-exception.filter';

interface RegisterResponse {
  goalId: string;
  version: number;
}

interface StateResponse {
  goalId: string;
  state: string;
  version: number;
}

interface ProblemDetailsResponse {
  title: string;
  status: number;
  detail: string;
}

const GOAL_ID = '018f6b5c-42e1-7000-8000-999999999999';
const IDENTITY_ID = '018f6b5c-42e1-7000-8000-111111111111';

describe('GoalsController (e2e)', () => {
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

  // ─── Register ─────────────────────────────────────────────────────────────

  it('POST /goals — should register and behave idempotently', async () => {
    const payload = {
      id: GOAL_ID,
      identityId: IDENTITY_ID,
      title: 'Run a half marathon',
      description: 'Train consistently',
    };

    const res1 = await request(app.getHttpServer())
      .post('/v1/goals')
      .send(payload)
      .expect(200);

    const body1 = res1.body as RegisterResponse;
    expect(body1.goalId).toBe(GOAL_ID);
    expect(body1.version).toBe(1);

    const res2 = await request(app.getHttpServer())
      .post('/v1/goals')
      .send({ ...payload, title: 'Different Title' })
      .expect(200);

    const body2 = res2.body as RegisterResponse;
    expect(body2.goalId).toBe(GOAL_ID);
    expect(body2.version).toBe(1); // idempotent — version does not change
  });

  it('POST /goals — should return 400 on invalid UUID', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/goals')
      .send({ id: 'bad-id', identityId: IDENTITY_ID, title: 'X' })
      .expect(400);
    expect((res.body as ProblemDetailsResponse).title).toBe(
      'BadRequestException',
    );
  });

  it('POST /goals — should return 400 on empty title', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/goals')
      .send({ id: GOAL_ID, identityId: IDENTITY_ID, title: '' })
      .expect(400);
    expect((res.body as ProblemDetailsResponse).title).toBe(
      'BadRequestException',
    );
  });

  // ─── Get / List ───────────────────────────────────────────────────────────

  it('GET /goals/:id — should return the registered goal', async () => {
    await request(app.getHttpServer())
      .post('/v1/goals')
      .send({ id: GOAL_ID, identityId: IDENTITY_ID, title: 'Learn DDD' })
      .expect(200);

    const res = await request(app.getHttpServer())
      .get(`/v1/goals/${GOAL_ID}`)
      .expect(200);

    expect(res.body).toMatchObject({
      id: GOAL_ID,
      title: 'Learn DDD',
      state: 'Draft',
      version: 1,
    });
  });

  it('GET /goals/:id — should return 404 for unknown id', async () => {
    const unknownId = '018f6b5c-42e1-7000-8000-000000000000';
    await request(app.getHttpServer())
      .get(`/v1/goals/${unknownId}`)
      .expect(404);
  });

  it('GET /goals — should list registered goals', async () => {
    await request(app.getHttpServer())
      .post('/v1/goals')
      .send({ id: GOAL_ID, identityId: IDENTITY_ID, title: 'Learn DDD' })
      .expect(200);

    const res = await request(app.getHttpServer()).get('/v1/goals').expect(200);
    expect(res.body).toMatchObject({ total: 1 });
  });

  // ─── Rename ───────────────────────────────────────────────────────────────

  it('PATCH /goals/:id — should rename a goal', async () => {
    await request(app.getHttpServer())
      .post('/v1/goals')
      .send({ id: GOAL_ID, identityId: IDENTITY_ID, title: 'Learn DDD' })
      .expect(200);

    const res = await request(app.getHttpServer())
      .patch(`/v1/goals/${GOAL_ID}`)
      .send({ title: 'Master DDD' })
      .expect(200);

    expect(res.body).toMatchObject({
      goalId: GOAL_ID,
      title: 'Master DDD',
      version: 2,
    });
  });

  // ─── Complete ─────────────────────────────────────────────────────────────

  it('POST /goals/:id/complete — should complete a goal idempotently', async () => {
    await request(app.getHttpServer())
      .post('/v1/goals')
      .send({ id: GOAL_ID, identityId: IDENTITY_ID, title: 'Learn DDD' })
      .expect(200);

    const r1 = await request(app.getHttpServer())
      .post(`/v1/goals/${GOAL_ID}/complete`)
      .expect(200);
    const r2 = await request(app.getHttpServer())
      .post(`/v1/goals/${GOAL_ID}/complete`)
      .expect(200);

    const b1 = r1.body as StateResponse;
    const b2 = r2.body as StateResponse;
    expect(b1.state).toBe('Completed');
    expect(b1.version).toBe(b2.version);
  });

  it('POST /goals/:id/complete — should return 404 for unknown id', async () => {
    const unknownId = '018f6b5c-42e1-7000-8000-000000000000';
    await request(app.getHttpServer())
      .post(`/v1/goals/${unknownId}/complete`)
      .expect(404);
  });

  // ─── Archive ──────────────────────────────────────────────────────────────

  it('POST /goals/:id/archive — should archive a goal and block further completion', async () => {
    await request(app.getHttpServer())
      .post('/v1/goals')
      .send({ id: GOAL_ID, identityId: IDENTITY_ID, title: 'Learn DDD' })
      .expect(200);

    const res = await request(app.getHttpServer())
      .post(`/v1/goals/${GOAL_ID}/archive`)
      .expect(200);
    expect((res.body as StateResponse).state).toBe('Archived');

    await request(app.getHttpServer())
      .post(`/v1/goals/${GOAL_ID}/complete`)
      .expect(409);
  });
});
