import amqp, { ConsumeMessage } from 'amqplib';
import config from 'config';
import { RabbitConsumerCallback } from './models/types';
import { RabbitMessageError } from './errors/RabbitMessageError';

const rabbitUsername = config.get<string>('rabbit.server.username');
const rabbitPassword = config.get<string>('rabbit.server.password');
const rabbitVHost = config.get<string>('rabbit.server.vhost');
const rabbitHost = config.get<string>('rabbit.server.hostname');
const rabbitPort = config.get<number>('rabbit.server.port');

export async function publishToQueue(queueName: string, message: string) {
  try {
    const rabbitURL = `amqp://${rabbitUsername}:${rabbitPassword}@${rabbitHost}:${rabbitPort}/${rabbitVHost}`;
    console.log('Publish message - rabbitURL: ', rabbitURL);
    const connection = await amqp.connect(rabbitURL);
    const channel = await connection.createChannel();

    await channel.assertQueue(queueName, { durable: false });

    channel.sendToQueue(queueName, Buffer.from(message));

    await channel.close();
    await connection.close();
  } catch (error) {
    console.error('Error in publishToQueue:', error);
    throw error;
  }
}

export async function consumeFromQueue(queueName: string, callback: RabbitConsumerCallback) {
  try {
    const rabbitURL = `amqp://${rabbitUsername}:${rabbitPassword}@${rabbitHost}:${rabbitPort}/${rabbitVHost}`;
    console.log('Consume message - rabbitURL: ', rabbitURL);
    const connection = await amqp.connect(rabbitURL);
    const channel = await connection.createChannel();

    await channel.assertQueue(queueName, { durable: false });

    channel.consume(queueName, msg => {
      if (msg?.content) {
        callback(channel, msg);
      } else {
        throw new RabbitMessageError('Cannot consume message from Rabbit.');
      }
    });
  } catch (error) {
    console.error('Error in consumeFromQueue:', error);
    throw error;
  }
}

export function checkRabbitMsg(msg: ConsumeMessage | null): string {
  if (msg) {
    if (msg.content) {
      return msg.content.toString();
    } else {
      throw new RabbitMessageError('Rabbit message content not provided.');
    }
  } else {
    throw new RabbitMessageError('Rabbit message not provided.');
  }
}
