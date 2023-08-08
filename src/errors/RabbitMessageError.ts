export class RabbitMessageError extends Error {
  name: string;
  cause?: string;
  data?: string;

  constructor(message: string, cause?: string, data?: string) {
    super(message);

    this.name = 'RabbitMessageError';
    this.cause = cause;
    this.data = data;
  }
}
