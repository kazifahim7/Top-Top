import type { Types } from "mongoose";

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
     preferredAreas: string[],
     age:string,
     position:string[],
     userName:string,
     //if player played then this static can updated
     matchPosition?: string
     redCard: number;
     yellowCard: number;
     contribution: number;
     assists: number;
     goal: number;
     tackle: number;
     save: number;
     rating: number;
     match:number,
     motm?:number,
     cleanSheet:number
}


export type OtpType ={
          id: Types.ObjectId,
          role: string,
          email: string,
          otp: number | string,
          otpExpiry: Date
     }