import type { Request, Response } from "express";
import { AreaService } from "./Area.service.js";



// GET /api/areas
export const getAllAreas = (req: Request, res: Response) => {
     const data = AreaService.getAllAreas();
     return res.status(200).json({
          success: true,
          total_cities: data.length,
          data,
     });
};

// GET /api/areas/cities
export const getCities = (req: Request, res: Response) => {
     const data = AreaService.getCities();
     return res.status(200).json({
          success: true,
          total: data.length,
          data,
     });
};

// GET /api/areas/:slug
// e.g. /api/areas/dubai  |  /api/areas/sharjah  |  /api/areas/abu-dhabi
export const getAreasByCity = (req: Request, res: Response) => {
     const { slug } = req.params;
     const data = AreaService.getAreasByCity(slug!);

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
};

// GET /api/areas/search?q=marina
export const searchAreas = (req: Request, res: Response) => {
     const q = req.query.q as string;

     if (!q || q.trim() === "") {
          return res.status(400).json({
               success: false,
               message: "Query parameter 'q' is required",
          });
     }

     const data = AreaService.searchAreas(q.trim());

     return res.status(200).json({
          success: true,
          total: data.length,
          data,
     });
};