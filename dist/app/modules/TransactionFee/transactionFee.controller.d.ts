import type { Request, Response } from "express";
export declare const TransactionFeeController: {
    getGlobalSetting: (req: Request, res: Response, next: import("express").NextFunction) => void;
    createGlobalSetting: (req: Request, res: Response, next: import("express").NextFunction) => void;
    updateGlobalSetting: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getCountryFees: (req: Request, res: Response, next: import("express").NextFunction) => void;
    updateCountryFixedFee: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getQuote: (req: Request, res: Response, next: import("express").NextFunction) => void;
};
//# sourceMappingURL=transactionFee.controller.d.ts.map