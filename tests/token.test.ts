import request from 'supertest';
import config from 'config';

import app from '../src/ps_app';

describe('Static token Protection', () => {
  it('should return 401 Unauthorized without any token', async () => {
    const response = await request(app.callback()).get('/');
    expect(response.status).toBe(401);
    expect(response.text).toBe('Unauthorized.');
  });

  it('should return 401 Unauthorized with an incorrect token', async () => {
    const response = await request(app.callback()).get('/').set('Authorization', 'Bearer incorrecttoken');
    expect(response.status).toBe(401);
    expect(response.text).toBe('Unauthorized.');
  });

  it('should return 200 OK with the correct token', async () => {
    const response = await request(app.callback())
      .get('/')
      .set('Authorization', `Bearer ${config.get('public_service.token')}`);
    expect(response.status).toBe(200);
    expect(response.text).toBe('Hello, World!');
  });
});
