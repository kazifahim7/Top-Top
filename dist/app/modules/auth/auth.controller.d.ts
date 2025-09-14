import { type Request, type Response } from "express";
export declare const authController: {
    createUser: (req: Request, res: Response, next: import("express").NextFunction) => void;
    logInUser: (req: Request, res: Response, next: import("express").NextFunction) => void;
    updateStatus: (req: Request, res: Response, next: import("express").NextFunction) => void;
    updateProfile: (req: Request, res: Response, next: import("express").NextFunction) => void;
    allUsers: (req: Request, res: Response, next: import("express").NextFunction) => void;
    singleUser: (req: Request, res: Response, next: import("express").NextFunction) => void;
    resetRequest: (req: Request, res: Response, next: import("express").NextFunction) => void;
    resetPassword: (req: Request, res: Response, next: import("express").NextFunction) => void;
    googleLogin: (req: Request, res: Response, next: import("express").NextFunction) => void;
    appleLogin: (req: Request, res: Response, next: import("express").NextFunction) => void;
};
//# sourceMappingURL=auth.controller.d.ts.map