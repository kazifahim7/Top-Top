import { type Request, type Response } from "express";
export declare const authController: {
    createUser: (req: Request, res: Response, next: import("express").NextFunction) => void;
    createOrganizer: (req: Request, res: Response, next: import("express").NextFunction) => void;
    logInUser: (req: Request, res: Response, next: import("express").NextFunction) => void;
    updateStatus: (req: Request, res: Response, next: import("express").NextFunction) => void;
    updateProfile: (req: Request, res: Response, next: import("express").NextFunction) => void;
    updateOwnCountry: (req: Request, res: Response, next: import("express").NextFunction) => void;
    updateUserCountryByAdmin: (req: Request, res: Response, next: import("express").NextFunction) => void;
    allUsers: (req: Request, res: Response, next: import("express").NextFunction) => void;
    myCountryPlayers: (req: Request, res: Response, next: import("express").NextFunction) => void;
    myCountryPlayerProfile: (req: Request, res: Response, next: import("express").NextFunction) => void;
    singleUser: (req: Request, res: Response, next: import("express").NextFunction) => void;
    resetRequest: (req: Request, res: Response, next: import("express").NextFunction) => void;
    resetPassword: (req: Request, res: Response, next: import("express").NextFunction) => void;
    sendPhoneOtp: (req: Request, res: Response, next: import("express").NextFunction) => void;
    verifyPhoneOtp: (req: Request, res: Response, next: import("express").NextFunction) => void;
    googleLogin: (req: Request, res: Response, next: import("express").NextFunction) => void;
    appleLogin: (req: Request, res: Response, next: import("express").NextFunction) => void;
    changePassword: (req: Request, res: Response, next: import("express").NextFunction) => void;
    playerProfile: (req: Request, res: Response, next: import("express").NextFunction) => void;
    deletePlayer: (req: Request, res: Response, next: import("express").NextFunction) => void;
    deleteAccount: (req: Request, res: Response, next: import("express").NextFunction) => void;
};
//# sourceMappingURL=auth.controller.d.ts.map