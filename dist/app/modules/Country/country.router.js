import express from "express";
import auth from "../../middleware/auth.js";
import { CountryController } from "./country.controller.js";
const router = express.Router();
router.get("/", CountryController.getCountries);
router.post("/", auth("admin"), CountryController.createCountry);
router.patch("/:countryCode", auth("admin"), CountryController.updateCountry);
router.delete("/:countryCode", auth("admin"), CountryController.removeCountry);
router.get("/:countryCode/areas", CountryController.getCountryAreas);
export const countryRouter = router;
//# sourceMappingURL=country.router.js.map