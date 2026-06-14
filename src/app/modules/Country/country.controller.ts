import type { Request, Response } from "express";
import catchAsync from "../../utils/catcgAsync.js";
import { CountryService } from "./country.service.js";

const getCountries = catchAsync(async (req: Request, res: Response) => {
     const includeInactive = req.query.includeInactive === "true";
     const result = await CountryService.getCountries(includeInactive);
     res.status(200).json({
          success: true,
          message: "Countries retrieved successfully",
          data: result,
     });
});

const createCountry = catchAsync(async (req: Request, res: Response) => {
     const result = await CountryService.createCountry(req.body);
     res.status(201).json({
          success: true,
          message: "Country created successfully",
          data: result,
     });
});

const updateCountry = catchAsync(async (req: Request, res: Response) => {
     const result = await CountryService.updateCountry(req.params.countryCode!, req.body);
     res.status(200).json({
          success: true,
          message: "Country updated successfully",
          data: result,
     });
});

const removeCountry = catchAsync(async (req: Request, res: Response) => {
     const result = await CountryService.deactivateCountry(req.params.countryCode!);
     res.status(200).json({
          success: true,
          message: "Country removed successfully",
          data: result,
     });
});

const getCountryAreas = catchAsync(async (req: Request, res: Response) => {
     const result = await CountryService.getAreasForCountry(req.params.countryCode);
     res.status(200).json({
          success: true,
          total: result.length,
          data: result,
     });
});

export const CountryController = {
     getCountries,
     createCountry,
     updateCountry,
     removeCountry,
     getCountryAreas,
};
