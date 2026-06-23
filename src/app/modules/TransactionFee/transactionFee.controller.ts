import type { Request, Response } from "express";
import catchAsync from "../../utils/catcgAsync.js";
import { TransactionFeeService } from "./transactionFee.service.js";

const getGlobalSetting = catchAsync(async (_req: Request, res: Response) => {
     const result = await TransactionFeeService.getGlobalSetting();
     res.status(200).json({
          success: true,
          message: "Transaction fee setting retrieved successfully",
          data: result,
     });
});

const createGlobalSetting = catchAsync(async (req: Request, res: Response) => {
     const result = await TransactionFeeService.createGlobalSetting(req.body);
     res.status(201).json({
          success: true,
          message: "Transaction fee setting created successfully",
          data: result,
     });
});

const updateGlobalSetting = catchAsync(async (req: Request, res: Response) => {
     const result = await TransactionFeeService.updateGlobalSetting(req.body);
     res.status(200).json({
          success: true,
          message: "Transaction fee setting updated successfully",
          data: result,
     });
});

const getCountryFees = catchAsync(async (req: Request, res: Response) => {
     const includeInactive = req.query.includeInactive === "true";
     const result = await TransactionFeeService.getCountryFees(includeInactive);
     res.status(200).json({
          success: true,
          message: "Country transaction fees retrieved successfully",
          data: result,
     });
});

const updateCountryFixedFee = catchAsync(async (req: Request, res: Response) => {
     const result = await TransactionFeeService.updateCountryFixedFee(req.params.countryCode!, req.body);
     res.status(200).json({
          success: true,
          message: "Country transaction fee updated successfully",
          data: result,
     });
});

const getQuote = catchAsync(async (req: Request, res: Response) => {
     const result = await TransactionFeeService.buildQuote(req.query as Record<string, unknown>);
     res.status(200).json({
          success: true,
          message: "Transaction fee quote retrieved successfully",
          data: result,
     });
});

export const TransactionFeeController = {
     getGlobalSetting,
     createGlobalSetting,
     updateGlobalSetting,
     getCountryFees,
     updateCountryFixedFee,
     getQuote,
};
