import type { NextFunction, Request, Response } from "express";
import { ZodType } from "zod";
declare const validateRequest: (schema: ZodType<any>) => (req: Request, res: Response, next: NextFunction) => void;
export default validateRequest;
//# sourceMappingURL=validatonRequest.d.ts.map