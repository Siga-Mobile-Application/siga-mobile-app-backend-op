import { Router } from "express";
import Data from "../../controller/data";

const dataRoutes = Router();

dataRoutes.post('/:user/:pass', Data.get);

export default dataRoutes;