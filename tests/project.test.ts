import request from 'supertest';
import config from 'config';

import app from '../src/ps_app';
import db from '../src/database/connection';
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

describe('Project API', () => {
  it('should retrieve a paginated list of projects (8 project each page)', async () => {
    const response = await request(app.callback())
      .get('/projects')
      .set('Authorization', `Bearer ${config.get('public_service.token')}`)
      .expect(200);

    expect(response.body.projects).toHaveLength(8);
  });

  it('should retrieve a project by its ID', async () => {
    const project: Project[] = await db('projects').limit(1);

    const response = await request(app.callback())
      .get(`/projects/${project[0].id}`)
      .set('Authorization', `Bearer ${config.get('public_service.token')}`)
      .expect(200);

    expect(response.body.id).toBe(project[0].id);
    expect(response.body.name).toBe(project[0].name);
    expect(response.body.user_id).toBe(project[0].user_id);
  });

  it('should return 404 when trying to retrieve a non-existing project', async () => {
    const response = await request(app.callback())
      .get('/projects/999')
      .set('Authorization', `Bearer ${config.get('public_service.token')}`);

    expect(response.status).toBe(404);
    expect(response.text).toBe('Project not found.');
  });

  it('should retrieve project with ID 1 with "hasOngoingDeployment" set to true and "hasLiveDeployment" set to true', async () => {
    const projectId = 1;

    const response = await request(app.callback())
      .get(`/projects/${projectId}`)
      .set('Authorization', `Bearer ${config.get('public_service.token')}`)
      .expect(200);

    const project = response.body;

    expect(project.id).toBe(project.id);
    expect(project.hasOngoingDeployment).toBe(true);
    expect(project.hasLiveDeployment).toBe(true);
  });

  it('should retrieve project with ID 2 with "hasOngoingDeployment" set to true and "hasLiveDeployment" set to false', async () => {
    const projectId = 2;

    const response = await request(app.callback())
      .get(`/projects/${projectId}`)
      .set('Authorization', `Bearer ${config.get('public_service.token')}`)
      .expect(200);

    const project = response.body;

    expect(project.id).toBe(project.id);
    expect(project.hasOngoingDeployment).toBe(true);
    expect(project.hasLiveDeployment).toBe(false);
  });

  it('should retrieve project with ID 3 with "hasOngoingDeployment" set to false and "hasLiveDeployment" set to true', async () => {
    const projectId = 3;

    const response = await request(app.callback())
      .get(`/projects/${projectId}`)
      .set('Authorization', `Bearer ${config.get('public_service.token')}`)
      .expect(200);

    const project = response.body;

    expect(project.id).toBe(project.id);
    expect(project.hasOngoingDeployment).toBe(false);
    expect(project.hasLiveDeployment).toBe(true);
  });

  it('should retrieve project with ID 4 with "hasOngoingDeployment" set to false and "hasLiveDeployment" set to false', async () => {
    const projectId = 4;

    const response = await request(app.callback())
      .get(`/projects/${projectId}`)
      .set('Authorization', `Bearer ${config.get('public_service.token')}`)
      .expect(200);

    const project = response.body;

    expect(project.id).toBe(project.id);
    expect(project.hasOngoingDeployment).toBe(false);
    expect(project.hasLiveDeployment).toBe(false);
  });

  it('should create a new deployment for a project', async () => {
    const project = await db.select('*').from('projects').orderBy('id', 'desc').first();

    const response = await request(app.callback())
      .post(`/projects/${project.id}/new_deployment`)
      .set('Authorization', `Bearer ${config.get('public_service.token')}`);

    expect(response.status).toBe(201);
    expect(response.body.status).toBe('pending');

    return await db('deployments').where('id', response.body.id).del();
  });
});
