import type { Request, Response } from "express";
export declare const stripeWebhook: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const verifyPayment: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=webhook.controller.d.ts.map