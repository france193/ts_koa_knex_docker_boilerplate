import { CustomHttpError } from './CustomHttpError';

export class NotFoundError extends CustomHttpError {
  constructor(resource: string) {
    super(404, `${resource} not found.`);
  }
}
