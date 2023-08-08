import Router from 'koa-router';
import generalController from '../controllers/generalController';
import { tokenProtectionMiddleware } from '../middlewares/token_middleware';

const router = new Router();

router.get('/', tokenProtectionMiddleware, generalController.getHelloWorld);

export default router;
