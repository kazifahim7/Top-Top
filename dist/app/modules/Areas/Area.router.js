import { Router } from "express";
import { getAllAreas, getAreasByCity, getCities, searchAreas } from "./Area.controller.js";
const router = Router();
router.get("/", getAllAreas);
router.get("/cities", getCities);
router.get("/search", searchAreas);
router.get("/:slug", getAreasByCity);
export const areaRouter = router;
//# sourceMappingURL=Area.router.js.map