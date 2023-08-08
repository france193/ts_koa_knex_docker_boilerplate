import request from 'supertest';
import config from 'config';

import app from '../src/ps_app';
import db from '../src/database/connection';

beforeAll(async () => {
  await db.migrate.latest({
    directory: 'src/database/migrations',
    tableName: 'knex_migrations',
  });
  await db.seed.run({
    directory: 'src/database/seeds',
  });
});

afterAll(async () => {
  // Clean up database after tests
  await db.migrate.rollback({
    directory: 'src/database/migrations',
    tableName: 'knex_migrations',
  });
  await db.destroy();
});

describe('Test Deployment Statistics Endpoint', () => {
  it('should get deployment statistics for a specific user', async () => {
    const userId = 1;

    const response = await request(app.callback())
      .get(`/deployments/statistics/${userId}`)
      .set('Authorization', `Bearer ${config.get('public_service.token')}`);

    // Assert the response status code and the structure of the response
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('averageWeeklySuccessfulDeployments');
    expect(response.body).toHaveProperty('averageWeeklyDeploymentCount');
  });

  it('should return a 404 error if requested statistics for an unexisting user', async () => {
    const userId = 999;

    const response = await request(app.callback())
      .get(`/deployments/statistics/${userId}`)
      .set('Authorization', `Bearer ${config.get('public_service.token')}`);

    // Assert the response status code and the structure of the response
    expect(response.status).toBe(404);
    expect(response.text).toBe('User not found.');
  });
});
