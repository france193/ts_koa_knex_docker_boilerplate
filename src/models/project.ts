// project.ts

export interface Project {
  id?: number;
  name: string;
  url?: string;
  app_secret: string;
  created_at: Date;
  user_id: number;
  hasOngoingDeployment?: boolean;
  hasLiveDeployment?: boolean;
}
