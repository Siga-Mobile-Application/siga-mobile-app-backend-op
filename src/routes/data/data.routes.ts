import { Router } from "express";
import Data from "../../controller/data";
import authMiddleware from "../../middleware/auth.middleware";

const dataRoutes = Router();

dataRoutes.get('/basic', authMiddleware, Data.getBasic);
dataRoutes.get('/history', authMiddleware, Data.getHistory);
dataRoutes.get('/schedule', authMiddleware, Data.getSchedule);
dataRoutes.get('/grade', authMiddleware, Data.getGrade);

export default dataRoutes;