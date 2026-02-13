import type { Request, Response } from "express";
export declare const TeamController: {
    createTeam: (req: Request, res: Response, next: import("express").NextFunction) => void;
    updateTeam: (req: Request, res: Response, next: import("express").NextFunction) => void;
    allTeams: (req: Request, res: Response, next: import("express").NextFunction) => void;
    myTeam: (req: Request, res: Response, next: import("express").NextFunction) => void;
    assignCaptain: (req: Request, res: Response, next: import("express").NextFunction) => void;
    removePlayer: (req: Request, res: Response, next: import("express").NextFunction) => void;
    invitePlayer: (req: Request, res: Response, next: import("express").NextFunction) => void;
    acceptInvite: (req: Request, res: Response, next: import("express").NextFunction) => void;
    rejectInvite: (req: Request, res: Response, next: import("express").NextFunction) => void;
    myRequest: (req: Request, res: Response, next: import("express").NextFunction) => void;
    DeleteTeam: (req: Request, res: Response, next: import("express").NextFunction) => void;
    singleTeam: (req: Request, res: Response, next: import("express").NextFunction) => void;
};
//# sourceMappingURL=team.controller.d.ts.map