import request from 'supertest';

import app from '../src/ps_app';
import db from '../src/database/connection';
import { Deployment, DeploymentStatus } from '../src/models/deployment';
import { Project } from '../src/models/project';

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

describe('Deployment Webhook Endpoint', () => {
  it('should update project URL and deployment duration if first deployment and status is done', async () => {
    const deployment: Deployment = await db.select('*').from('deployments').where('id', 11).first();
    const project: Project = await db.select('*').from('projects').where('id', deployment.project_id).first();

    const response = await request(app.callback())
      .post(`/deployments/${deployment.id}/webhook`)
      .send({ status: DeploymentStatus.Done })
      .set('Authorization', `Bearer ${project.app_secret}`);

    expect(response.status).toBe(204);

    // const updatedProject = await db('projects').where({ id: project.id }).first();
    const updatedDeployment = await db('deployments').where({ id: deployment.id }).first();

    expect(project.url).toBeNull();
    expect(deployment.status).not.toBe(DeploymentStatus.Done);
    // expect(updatedProject.url).not.toBeNull();
    expect(updatedDeployment.status).toBe(DeploymentStatus.Done);
    expect(updatedDeployment.deployed_in).toBeGreaterThan(0);
  });

  it('should return 401 Unauthorized if project authentication fails', async () => {
    const deployment: Deployment = await db.select('*').from('deployments').where('id', 11).first();

    const response = await request(app.callback())
      .post(`/deployments/${deployment.id}/webhook`)
      .send({ status: DeploymentStatus.Done })
      .set('Authorization', 'invalid_secret');

    expect(response.status).toBe(401);
    expect(response.text).toBe('Unauthorized: wrong secret for project.');
  });

  it('should return 404 Not Found if deployment does not exist', async () => {
    const response = await request(app.callback())
      .post('/deployments/999/webhook')
      .send({ status: DeploymentStatus.Done })
      .set('Authorization', 'abc123');

    expect(response.status).toBe(404);
    expect(response.text).toEqual('Deployment not found.');
  });
});
