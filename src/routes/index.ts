import { Router } from 'express';
import dataRoutes from './data/data.routes';

const routes = Router();

routes.use('/data', dataRoutes);

export default routes;