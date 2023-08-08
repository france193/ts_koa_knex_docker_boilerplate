import { CustomHttpError } from './CustomHttpError';

export class AuthenticationError extends CustomHttpError {
  constructor() {
    super(401, 'Unauthorized.');
  }
}
