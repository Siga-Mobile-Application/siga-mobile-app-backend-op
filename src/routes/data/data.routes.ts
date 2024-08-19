import { Router } from "express";
import Data from "../../controller/data";

const dataRoutes = Router();

dataRoutes.get('/', Data.get);

export default dataRoutes;