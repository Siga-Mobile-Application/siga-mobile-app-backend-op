import { Router } from "express";
import Data from "../../controller/data";

const dataRoutes = Router();

dataRoutes.post('/', Data.get);

export default dataRoutes;