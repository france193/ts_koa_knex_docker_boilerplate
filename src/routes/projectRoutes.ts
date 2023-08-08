import Router from 'koa-router';
import projectController from '../controllers/projectController';
import { tokenProtectionMiddleware } from '../middlewares/token_middleware';

const router = new Router();

router.get('/', tokenProtectionMiddleware, projectController.getPaginatedProjects);
router.get('/:id', tokenProtectionMiddleware, projectController.getProjectById);
router.post('/:id/new_deployment', tokenProtectionMiddleware, projectController.createDeployment);

export default router;
