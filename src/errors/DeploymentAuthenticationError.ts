import { CustomHttpError } from './CustomHttpError';

export class DeploymentAuthenticationError extends CustomHttpError {
  constructor() {
    super(401, 'Unauthorized: wrong secret for project.');
  }
}
