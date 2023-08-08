import Koa from 'koa';
import config from 'config';
import { AuthenticationError } from '../errors/AuthenticationError';

export const tokenProtectionMiddleware = async (ctx: Koa.Context, next: Koa.Next) => {
  const { authorization } = ctx.headers;

  if (!authorization || authorization !== `Bearer ${config.get('public_service.token')}`) {
    ctx.throw(new AuthenticationError());
  }

  await next();
};
