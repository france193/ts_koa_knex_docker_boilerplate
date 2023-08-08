import { Context } from 'koa';
import config from 'config';
import db from '../database/connection';
import { Deployment, DeploymentStatus, DeploymentUpdate } from '../models/deployment';
import { NotFoundError } from '../errors/NotFoundError';
import { DeploymentAuthenticationError } from '../errors/DeploymentAuthenticationError';
import { generateRandomUrl } from '../helpers';
import { publishToQueue } from '../rabbit';
import { DataAggregationServiceData, DataAggregationServiceDataPayload, EventType } from '../models/update';

import { User } from '../models/user';

const deploymentController = {
  async getPaginatedDeployments(ctx: Context) {
    const pageSize = 8;
    const page = parseInt(ctx.query.page as string) || 1;
    const offset = (Number(page) - 1) * Number(pageSize);

    const result = await db('deployments').count();
    const totalCount = Number(result[0].count);
    const totalPages = Math.ceil(totalCount / Number(pageSize));

    const deployments: Deployment[] = await db('deployments').limit(pageSize).offset(offset);

    ctx.body = {
      deployments,
      totalCount: totalCount,
      totalPages,
    };
  },

  async getDeploymentById(ctx: Context) {
    const { id } = ctx.params;
    const deployment = await db('deployments').where('id', id).first();

    if (!deployment) {
      ctx.throw(new NotFoundError('Deployment'));
    }

    ctx.body = deployment;
  },

  async cancelDeployment(ctx: Context) {
    const { id } = ctx.params;
    const deployment = await db('deployments').where('id', id).first();

    if (!deployment) {
      ctx.throw(new NotFoundError('Deployment'));
    }
    const previousStatus = deployment.status;

    await db('deployments').where('id', id).update({ status: DeploymentStatus.Cancelled });

    ctx.status = 200;

    const payload: DataAggregationServiceDataPayload = {
      projectId: deployment.project_id,
      deploymentId: deployment.id,
      previousStatus: previousStatus,
      newDeploymentStatus: DeploymentStatus.Cancelled,
    };

    // create event data
    const updateData: DataAggregationServiceData = {
      eventType: EventType.Create,
      created_at: new Date(),
      payload: payload,
    };

    // Emit event to data aggregation service asynchronously
    const messageToSend = JSON.stringify(updateData);
    await publishToQueue(config.get<string>('rabbit.queues.updates'), messageToSend);
  },

  async handleWebhook(ctx: Context) {
    const { id } = ctx.params;

    const deploymentUpdate: DeploymentUpdate = ctx.request.body as DeploymentUpdate;

    const { authorization } = ctx.headers;

    const deployment = await db('deployments').where('id', id).first();
    if (!deployment) {
      ctx.throw(new NotFoundError('Deployment'));
    }

    const oldStatus = deployment.status;

    const project = await db('projects').where('id', deployment.project_id).first();
    if (!project) {
      ctx.throw(new NotFoundError('Project'));
    }

    if (authorization !== `Bearer ${project.app_secret}`) {
      ctx.throw(new DeploymentAuthenticationError());
    }

    await db('deployments').where('id', deployment.id).update({ status: deploymentUpdate.status });

    const deploymentsCountResult = await db('deployments').where('project_id', project.id).count();
    const deploymentCount = Number(deploymentsCountResult[0].count);

    if (deploymentCount === 1 && deploymentUpdate.status === DeploymentStatus.Done) {
      const randomUrl = generateRandomUrl();
      await db('projects').where('id', project.id).update({ url: randomUrl });
    }

    if (deploymentUpdate.status === DeploymentStatus.Done) {
      const lastPendingDeployment = await db('deployments')
        .whereNotNull('created_at')
        .where({
          project_id: project.id,
          status: DeploymentStatus.Pending,
        })
        .orderBy('created_at', 'desc')
        .first();

      let deployedIn = Math.floor((new Date().getTime() - new Date(deployment.created_at).getTime()) / 1000);

      if (lastPendingDeployment) {
        deployedIn = Math.floor(
          (new Date(lastPendingDeployment.created_at).getTime() - new Date(deployment.created_at).getTime()) / 1000,
        );
      }

      await db('deployments').where('id', deployment.id).update({ deployed_in: deployedIn });
    }

    const payload: DataAggregationServiceDataPayload = {
      projectId: deployment.project_id,
      deploymentId: deployment.id,
      previousStatus: oldStatus,
      newDeploymentStatus: deploymentUpdate.status,
    };

    // create event data
    const updateData: DataAggregationServiceData = {
      eventType: EventType.Create,
      created_at: new Date(),
      payload: payload,
    };

    // Emit event to data aggregation service asynchronously
    const messageToSend = JSON.stringify(updateData);
    await publishToQueue(config.get<string>('rabbit.queues.updates'), messageToSend);

    ctx.status = 204;
  },

  async computeDeploymentStatisticsForUser(ctx: Context) {
    const userId = ctx.params.userId;

    const user: User = await db('users').where({ id: userId }).first();
    if (!user) {
      ctx.throw(new NotFoundError('User'));
    }

    const stats = await calculateUserDeploymentStats(userId);

    ctx.body = stats;
  },
};

async function calculateUserDeploymentStats(userId: number) {
  const userProjectIdsResult: { id: number }[] = await db('projects').select('id').where({ user_id: userId });
  const userProjectIds = userProjectIdsResult.map(obj => obj.id);

  const successfulDeployments: Deployment[] = await db('deployments')
    .whereIn('project_id', userProjectIds)
    .where({ status: DeploymentStatus.Done });
  const allDeployments: Deployment[] = await db('deployments').whereIn('project_id', userProjectIds);

  const averageWeeklySuccessfulDeployments = calculateAverageWeeklyDeployments(successfulDeployments);
  const averageWeeklyDeploymentCount = calculateAverageWeeklyDeployments(allDeployments);

  return {
    averageWeeklySuccessfulDeployments,
    averageWeeklyDeploymentCount,
  };
}

function calculateAverageWeeklyDeployments(deployments: Deployment[]) {
  const totalDeployments = deployments.length;
  // Assuming 52 weeks in a year
  const average = totalDeployments / 52;

  return parseFloat(average.toFixed(2));
}

export default deploymentController;
