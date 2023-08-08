import Router from 'koa-router';
import projectRoutes from './projectRoutes';
import deploymentRoutes from './deploymentRoutes';
import generalRoutes from './generalRoutes';

const router = new Router();

router.use('/', generalRoutes.routes());
router.use('/projects', projectRoutes.routes());
router.use('/deployments', deploymentRoutes.routes());

export default router;
