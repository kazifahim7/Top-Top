import type { Request, Response } from "express";
import { AreaService } from "./Area.service.js";
import catchAsync from "../../utils/catcgAsync.js";



// GET /api/areas
export const getAllAreas = catchAsync(async (req: Request, res: Response) => {
     const data = await AreaService.getAllAreas(req.query.countryCode);
     return res.status(200).json({
          success: true,
          total_cities: data.length,
          data,
     });
});

// GET /api/areas/cities
export const getCities = catchAsync(async (req: Request, res: Response) => {
     const data = await AreaService.getCities(req.query.countryCode);
     return res.status(200).json({
          success: true,
          total: data.length,
          data,
     });
});

// GET /api/areas/:slug
// e.g. /api/areas/dubai  |  /api/areas/sharjah  |  /api/areas/abu-dhabi
export const getAreasByCity = catchAsync(async (req: Request, res: Response) => {
     const { slug } = req.params;
     const data = await AreaService.getAreasByCity(slug!, req.query.countryCode);

     if (!data) {
          return res.status(404).json({
               success: false,
               message: `No city found with slug "${slug}"`,
          });
     }

     return res.status(200).json({
          success: true,
          data,
     });
});

// GET /api/areas/search?q=marina
export const searchAreas = catchAsync(async (req: Request, res: Response) => {
     const q = req.query.q as string;

     if (!q || q.trim() === "") {
          return res.status(400).json({
               success: false,
               message: "Query parameter 'q' is required",
          });
     }

     const data = await AreaService.searchAreas(q.trim(), req.query.countryCode);

     return res.status(200).json({
          success: true,
          total: data.length,
          data,
     });
});
