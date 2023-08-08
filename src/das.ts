import { ConsumeMessage } from 'amqplib';
import { Channel } from 'amqp-connection-manager';
import { checkRabbitMsg, consumeFromQueue } from './rabbit';
import config from 'config';
import { DataAggregationServiceData } from './models/update';
import { Event } from './models/event';
import db from '../src/database/connection';
// import app from './das_app';

// Start rabbit message consumption
consumeFromQueue(config.get<string>('rabbit.queues.updates'), process_message);

async function process_message(channel: Channel, msg: ConsumeMessage) {
  try {
    console.log('New Message!');
    // read message from rabbit
    const messageContent = checkRabbitMsg(msg);
    const dataAggregationServiceData: DataAggregationServiceData = JSON.parse(messageContent);

    const newEvent: Event = {
      name: dataAggregationServiceData.eventType,
      created_at: dataAggregationServiceData.created_at,
      payload: {
        ...dataAggregationServiceData.payload,
      },
    };

    await db('events').insert(newEvent);
  } catch (e: unknown) {
    console.log(e);
  } finally {
    channel.ack(msg);
  }
}

// const port = process.env.PORT || config.get<number>('data_aggregation_service.port');

// const public_service_server = app.listen(port, () => {
//   console.log(`Listening to http://localhost:${port} 🚀`);
// });
