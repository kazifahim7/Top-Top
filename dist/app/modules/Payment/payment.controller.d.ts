import { type Request, type Response } from "express";
export declare const joinLobby: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const paymentSuccess: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const paymentCancel: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const allPaymentHistory: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const allPaymentHistoryOrganizer: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const makePaid: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=payment.controller.d.ts.map