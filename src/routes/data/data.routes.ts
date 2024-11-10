import { Router } from "express";
import Data from "../../controller/data";
import authMiddleware from "../../middleware/auth.middleware";

const dataRoutes = Router();

dataRoutes.post('/', authMiddleware, Data.getAll, );
dataRoutes.post('/history', authMiddleware, Data.getHistory);
dataRoutes.post('/schedule', authMiddleware, Data.getSchedule);

export default dataRoutes;