import Koa from 'koa';
import logger from 'koa-logger';
import json from 'koa-json';
import bodyParser from 'koa-bodyparser';

import routes from './routes';
import { CustomHttpError } from './errors/CustomHttpError';

const app = new Koa();

// Middlewares
app.use(json());
app.use(logger());
app.use(bodyParser());

// Routes
app.use(routes.routes()).use(routes.allowedMethods());

// Error handling
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    console.info(err);

    if (isError(err)) {
      // Handle the custom error
      ctx.status = err.status;
      ctx.body = { error: err.message };
    } else {
      // Handle other types of errors
      ctx.status = 500;
      ctx.body = { error: 'Internal server error' };
    }
    return;
  }
});

function isError(value: unknown): value is CustomHttpError {
  return value instanceof CustomHttpError;
}

export default app;
