export type TCreateProfile = {
    FullName: string;
    email: string;
    password: string;
    role: "admin" | "player" | "organizer";
    isBlocked: "active" | "block";
    mobile?: string;
    socialProfile: string[];
    imageUrl: string;
    nationality: string;
    dominantFoot: string;
    playingDays: string[];
    gameMode: string;
    preferredAreas: string;
    age: string;
    position: string[];
    userName: string;
    matchPosition?: string;
    redCard: number;
    yellowCard: number;
    substitution: number;
    assists: number;
    goal: number;
    tackle: number;
    save: number;
    rating: number;
};
//# sourceMappingURL=auth.interface.d.ts.map