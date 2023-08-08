import request from 'supertest';
import config from 'config';

import app from '../src/ps_app';
import db from '../src/database/connection';
import { Deployment, DeploymentStatus } from '../src/models/deployment';

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

describe('Deployments API', () => {
  it('should retrieve a paginated list of deployments (8 projects each page)', async () => {
    const response = await request(app.callback())
      .get('/deployments')
      .set('Authorization', `Bearer ${config.get('public_service.token')}`);

    expect(response.status).toBe(200);
    expect(response.body.deployments).toHaveLength(8);
  });

  it('should retrieve a deployment by its ID', async () => {
    const deployment: Deployment = await db('projects').limit(1).first();

    const response = await request(app.callback())
      .get(`/projects/${deployment.id}`)
      .set('Authorization', `Bearer ${config.get('public_service.token')}`)
      .expect(200);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe(deployment.status);
    // expect(response.body.created_at).toBe(deployment.created_at);
    expect(response.body.project_id).toBe(deployment.project_id);
  });

  it('should return 404 when trying to retrieve a non-existing deployment', async () => {
    const response = await request(app.callback())
      .get('/deployments/999')
      .set('Authorization', `Bearer ${config.get('public_service.token')}`);

    expect(response.status).toBe(404);
    expect(response.text).toBe('Deployment not found.');
  });

  it('should set a deployment to "cancel" status', async () => {
    const deployment: Deployment = await db
      .select('*')
      .from('deployments')
      .whereNot('status', DeploymentStatus.Cancelled)
      .orderBy('id', 'desc')
      .first();

    const response = await request(app.callback())
      .post(`/deployments/${deployment.id}/cancel`)
      .set('Authorization', `Bearer ${config.get('public_service.token')}`);

    expect(response.status).toBe(200);

    const canceledDeployment = await db('deployments').where({ id: deployment.id }).first();
    expect(canceledDeployment.status).toBe(DeploymentStatus.Cancelled);
  });

  it('should return 404 Not Found if trying to cancel a deployment that does not exist', async () => {
    const response = await request(app.callback())
      .post('/deployments/999/cancel')
      .set('Authorization', `Bearer ${config.get('public_service.token')}`);

    expect(response.status).toBe(404);
    expect(response.text).toBe('Deployment not found.');
  });
});
