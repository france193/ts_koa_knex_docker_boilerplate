import config from 'config';
import app from './ps_app';

const port = process.env.PORT || config.get<number>('public_service.port');

const public_service_server = app.listen(port, () => {
  console.log(`Listening to http://localhost:${port} 🚀`);
});

export default public_service_server;
