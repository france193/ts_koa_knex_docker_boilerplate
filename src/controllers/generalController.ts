import { Context, Next } from 'koa';

// Simple test API
const generalcontroller = {
  async getHelloWorld(ctx: Context, next: Next) {
    ctx.body = 'Hello, World!';
    await next();
  },
};

export default generalcontroller;
