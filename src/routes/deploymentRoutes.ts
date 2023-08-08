import Router from 'koa-router';
import deploymentController from '../controllers/deploymentController';
import { tokenProtectionMiddleware } from '../middlewares/token_middleware';

const router = new Router();

router.get('/', tokenProtectionMiddleware, deploymentController.getPaginatedDeployments);
router.get('/:id', tokenProtectionMiddleware, deploymentController.getDeploymentById);
router.get('/statistics/:userId', tokenProtectionMiddleware, deploymentController.computeDeploymentStatisticsForUser);
router.post('/:id/cancel', tokenProtectionMiddleware, deploymentController.cancelDeployment);
router.post('/:id/webhook', deploymentController.handleWebhook);

export default router;
