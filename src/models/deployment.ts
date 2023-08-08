// deployment.ts

export interface DeploymentUpdate {
  status: DeploymentStatus;
  duration: number;
}

export enum DeploymentStatus {
  Pending = 'pending',
  Building = 'building',
  Deploying = 'deploying',
  Failed = 'failed',
  Cancelled = 'cancelled',
  Done = 'done',
}

export interface Deployment {
  id?: number;
  deployed_in?: number;
  status: DeploymentStatus;
  created_at: Date;
  project_id: number;
}
