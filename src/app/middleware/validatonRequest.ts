

import type { NextFunction, Request, Response } from "express";

import catchAsync from "../utils/catcgAsync.js";

import { ZodType } from "zod";

const validateRequest = (schema: ZodType<any>) => {
     return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
          await schema.parseAsync({
               body: req.body,
               cookies: req.cookies
          })
          next()
     })
}


export default validateRequest