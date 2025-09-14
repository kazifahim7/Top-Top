export type TCreateProfile = {
     FullName: string,
     email: string,
     password: string,
     role: "admin" | "player" | "organizer",
     isBlocked: "active" | "block",
     mobile?: string,
     socialProfile: string[],
     imageUrl: string,
     nationality: string,
     dominantFoot: string,
     playingDays: string[],
     gameMode: string,
     preferredAreas: string
}