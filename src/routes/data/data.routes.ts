import { Router } from "express";
import Data from "../../controller/data";

const dataRoutes = Router();

dataRoutes.post('/', Data.getAll);
dataRoutes.post('/history', Data.getHistory);
dataRoutes.post('/schedule', Data.getSchedule);

export default dataRoutes;