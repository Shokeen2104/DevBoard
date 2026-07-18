const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { app } = require('../server');

let mongoServer;
let token;
let workspaceId;
let boardId;
let listId1;
let listId2;
let taskId;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'testsecret';
  process.env.REFRESH_TOKEN_SECRET = 'testrefreshsecret';
  
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  // 1. Create a user and get token
  const res = await request(app).post('/api/auth/register').send({
    name: 'Test User',
    email: 'test@test.com',
    password: 'password123'
  });
  token = res.body.accessToken;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Integration Flow: Board -> Task -> Move', () => {
  it('should create a workspace', async () => {
    const res = await request(app)
      .post('/api/workspaces')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test Workspace' });
    
    expect(res.status).toBe(201);
    workspaceId = res.body._id;
  });

  it('should create a board', async () => {
    const res = await request(app)
      .post(`/api/workspaces/${workspaceId}/boards`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Test Board' });
    
    expect(res.status).toBe(201);
    boardId = res.body._id;
  });

  it('should create two lists', async () => {
    const res1 = await request(app)
      .post(`/api/boards/${boardId}/lists`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'To Do', order: 1000 });
    
    listId1 = res1.body._id;

    const res2 = await request(app)
      .post(`/api/boards/${boardId}/lists`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Done', order: 2000 });
    
    listId2 = res2.body._id;

    expect(res1.status).toBe(201);
    expect(res2.status).toBe(201);
  });

  it('should create a task', async () => {
    const res = await request(app)
      .post(`/api/lists/${listId1}/tasks`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Test Task', order: 1000 });
    
    expect(res.status).toBe(201);
    expect(res.body.listId).toBe(listId1);
    taskId = res.body._id;
  });

  it('should move the task to the second list with new order', async () => {
    const newOrder = 1500;
    const res = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ listId: listId2, order: newOrder });
    
    expect(res.status).toBe(200);
    expect(res.body.listId).toBe(listId2);
    expect(res.body.order).toBe(newOrder);
  });
});
