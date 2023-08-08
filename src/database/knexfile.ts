import { Knex } from 'knex';

interface KnexConfig {
  [key: string]: Knex.Config;
}

const developmentConfig: Knex.Config = {
  client: 'pg',
  connection: {
    host: 'postgresql',
    port: 5432,
    user: 'admin',
    password: 'password',
    database: 'db',
  },
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    directory: './migrations',
    tableName: 'knex_migrations',
  },
  seeds: {
    directory: './seeds',
  },
};

const localConfig: Knex.Config = {
  client: 'pg',
  connection: {
    host: '0.0.0.0',
    port: 5432,
    user: 'admin',
    password: 'password',
    database: 'db',
  },
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    directory: './migrations',
    tableName: 'knex_migrations',
  },
  seeds: {
    directory: './seeds',
  },
};

const testConfig: Knex.Config = {
  client: 'sqlite3',
  connection: {
    filename: ':memory:',
  },
  useNullAsDefault: true,
  migrations: {
    directory: './migrations',
    tableName: 'knex_migrations',
  },
  seeds: {
    directory: './seeds',
  },
};

const knexConfig: KnexConfig = {
  default: developmentConfig,
  test: testConfig,
  development: developmentConfig,
  local: localConfig,
};

export default knexConfig;
