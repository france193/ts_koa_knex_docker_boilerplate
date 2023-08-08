import { Context } from 'koa';
import db from '../database/connection';
import { Project } from '../models/project';
import { Deployment, DeploymentStatus } from '../models/deployment';
import { NotFoundError } from '../errors/NotFoundError';
import { publishToQueue } from '../rabbit';
import config from 'config';
import { DataAggregationServiceData, DataAggregationServiceDataPayload, EventType } from '../models/update';

const projectController = {
  async getPaginatedProjects(ctx: Context) {
    const pageSize = 8;
    const page = parseInt(ctx.query.page as string) || 1;
    const offset = (Number(page) - 1) * Number(pageSize);

    const result = await db('projects').count();
    const totalCount = Number(result[0].count);
    const totalPages = Math.ceil(totalCount / Number(pageSize));

    const projects: Project[] = await db('projects').limit(pageSize).offset(offset);

    const projectsWithFlags = await Promise.all(
      projects.map(async project => {
        const hasOngoingDeployment = await db('deployments')
          .where('project_id', project.id)
          .whereIn('status', ['pending', 'building', 'deploying'])
          .first();

        const hasLiveDeployment = await db('deployments')
          .where('project_id', project.id)
          .where('status', 'done')
          .first();

        return {
          ...project,
          hasOngoingDeployment: !!hasOngoingDeployment,
          hasLiveDeployment: !!hasLiveDeployment,
        };
      }),
    );

    ctx.body = {
      projects: projectsWithFlags,
      totalCount: totalCount,
      totalPages,
    };
  },

  async getProjectById(ctx: Context) {
    const { id } = ctx.params;
    const project = await db('projects').where('id', id).first();

    if (!project) {
      ctx.throw(new NotFoundError('Project'));
    }

    const deployments = await db('deployments').where('project_id', id);

    const hasOngoingDeployment = deployments.some(
      deployment =>
        deployment.status === 'pending' || deployment.status === 'building' || deployment.status === 'deploying',
    );

    const hasLiveDeployment = deployments.some(deployment => deployment.status === 'done');

    ctx.body = {
      ...project,
      hasOngoingDeployment,
      hasLiveDeployment,
    };
  },

  async createDeployment(ctx: Context) {
    const { id } = ctx.params;

    const project = await db('projects').where('id', id).first();

    if (!project) {
      ctx.throw(new NotFoundError('Project'));
    }

    // This is done because incremental id is not working properly
    const result = await db('deployments').max('id as latestId');
    const latestId = result[0].latestId;

    const newId = latestId + 1;

    const deployment: Deployment = {
      id: newId,
      status: DeploymentStatus.Pending,
      deployed_in: 10,
      created_at: new Date(),
      project_id: id,
    };

    await db('deployments').insert(deployment);

    const payload: DataAggregationServiceDataPayload = {
      projectId: deployment.project_id,
      deploymentId: newId,
      newDeploymentStatus: deployment.status,
    };

    // create event data
    const updateData: DataAggregationServiceData = {
      eventType: EventType.Create,
      created_at: new Date(),
      payload: payload,
    };

    const messageToSend = JSON.stringify(updateData);
    await publishToQueue(config.get<string>('rabbit.queues.updates'), messageToSend);

    ctx.status = 201;
    ctx.body = deployment;
  },
};

export default projectController;
