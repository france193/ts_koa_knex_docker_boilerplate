// import Koa from 'koa';
// import logger from 'koa-logger';
// import json from 'koa-json';
// import bodyParser from 'koa-bodyparser';

// import db from './database/connection';
// import { CustomHttpError } from './errors/CustomHttpError';
// import Router from 'koa-router';
// import { Event } from './models/event';

// const app = new Koa();
// const router = new Router();

// // Middlewares
// app.use(json());
// app.use(logger());
// app.use(bodyParser());

// // API endpoint to create new events
// router.post('/events', async ctx => {
//   try {
//     const { name, payload } = ctx.request.body as Event;

//     if (!name || !payload) {
//       ctx.status = 400;
//       ctx.body = { error: 'Missing name or payload in the request body' };
//       return;
//     }

//     const newEvent: Event = {
//       name,
//       payload,
//       created_at: new Date(),
//     };

//     await db('events').insert(newEvent);

//     ctx.status = 201;
//     ctx.body = newEvent;
//   } catch (error) {
//     console.error('Error creating event:', error);
//     ctx.status = 500;
//     ctx.body = { error: 'Failed to create event' };
//   }
// });

// // Error handling
// app.use(async (ctx, next) => {
//   try {
//     await next();
//   } catch (err) {
//     console.info(err);

//     if (isError(err)) {
//       // Handle the custom error
//       ctx.status = err.status;
//       ctx.body = { error: err.message };
//     } else {
//       // Handle other types of errors
//       ctx.status = 500;
//       ctx.body = { error: 'Internal server error' };
//     }
//     return;
//   }
// });

// function isError(value: unknown): value is CustomHttpError {
//   return value instanceof CustomHttpError;
// }

// export default app;
