import { DeploymentStatus } from './deployment';

export enum EventType {
  Create = 'deployment_created',
  Cancel = 'deployment_cancelled',
  Update = 'deployment_updated',
}

export interface DataAggregationServiceDataPayload {
  projectId: number;
  deploymentId: number;
  previousStatus?: DeploymentStatus;
  newDeploymentStatus?: DeploymentStatus;
}

export interface DataAggregationServiceData {
  created_at: Date;
  eventType: EventType;
  payload: DataAggregationServiceDataPayload;
}
