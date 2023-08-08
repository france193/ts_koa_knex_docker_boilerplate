import { Knex } from 'knex';

export const up = (knex: Knex): Knex.SchemaBuilder => {
  return knex.schema
    .createTable('users', (table: Knex.CreateTableBuilder) => {
      table.increments('id').primary();
      table.string('email').notNullable();
      table.string('username').notNullable();
      // table.timestamps(false, true);
      table.timestamp('created_at').defaultTo(knex.fn.now());
    })
    .createTable('projects', (table: Knex.CreateTableBuilder) => {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.string('url').nullable();
      table.string('app_secret').notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());

      table.integer('user_id').unsigned();
      table.foreign('user_id').references('id').inTable('users');
    })
    .createTable('deployments', (table: Knex.CreateTableBuilder) => {
      table.increments('id').primary();
      table.integer('deployed_in').nullable();
      table.string('status').notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());

      table.integer('project_id').unsigned();
      table.foreign('project_id').references('id').inTable('projects');
    })
    .createTable('events', (table: Knex.CreateTableBuilder) => {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.json('payload').notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
    });
};

export const down = (knex: Knex): Knex.SchemaBuilder => {
  return knex.schema
    .dropTableIfExists('events')
    .dropTableIfExists('deployments')
    .dropTableIfExists('projects')
    .dropTableIfExists('users');
};

export const config = { transaction: false };
