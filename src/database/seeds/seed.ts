import { Knex } from 'knex';
import users from '../../../users.json';
import projects from '../../../projects.json';
import deployments from '../../../deployments.json';

exports.seed = async function (knex: Knex) {
  // Deletes ALL existing entries
  await knex('users').del();
  await knex('deployments').del();
  await knex('projects').del();

  await knex('users').insert(users);
  await knex('projects').insert(projects);
  await knex('deployments').insert(deployments);
};
