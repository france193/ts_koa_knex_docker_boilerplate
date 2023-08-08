import { AmqpConnectionManager } from 'amqp-connection-manager';
import { Channel, ConsumeMessage } from 'amqplib';

export interface RabbitOptions {
  reconnectTimeInSeconds: number;
  heartbeatIntervalInSeconds: number;
}

export interface RabbitQueueConsumeOptions {
  connection: AmqpConnectionManager;
  queue_name: string;
  isDurable: boolean;
  isNoAckAllowed: boolean;
  message_prefetch: number;
}

export interface RabbitQueuePublishOptions {
  connection: AmqpConnectionManager;
  queue_name: string;
  isDurable: boolean;
}

export interface RabbitQueueConsumeOptions {
  connection: AmqpConnectionManager;
  queue_name: string;
  isDurable: boolean;
  isNoAckAllowed: boolean;
  message_prefetch: number;
}

export interface RabbitQueueConsumeOptions {
  connection: AmqpConnectionManager;
  queue_name: string;
  isDurable: boolean;
  isNoAckAllowed: boolean;
  message_prefetch: number;
}

export interface RabbitConsumerCallback {
  (channel: Channel, msg: ConsumeMessage): Promise<void>;
}
