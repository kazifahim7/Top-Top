

import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

import { userModel } from './auth.model.js';
import AppError from '../../Error/AppError.js';
import config from '../../config/index.js';
import emailSender from '../../utils/sendEmail.js';
import type { TCreateProfile } from './auth.interface.js';
import QueryBuilder from '../../builder/QueryBuilder.js';
import { LobbyModel } from '../Lobby/lobby.model.js';
import { email } from 'zod';

const createUserIntoDB = async (payload: TCreateProfile) => {
     const isUserAlreadyExist = await userModel.findOne({ email: payload?.email })
     if (isUserAlreadyExist) {
          throw new AppError(401, "This user Already exists");

     }
     payload.password = await bcrypt.hash(payload.password, Number(config.salt_round))
     const result = await userModel.create(payload)
     return result;
}

const loginUser = async (payload: Pick<TCreateProfile, "email" | "password">) => {

     const isUserExist = await userModel.findOne({ email: payload.email })
     if (!isUserExist) {
          throw new AppError(404, "This user Not Found");

     }
     if (isUserExist.isBlocked === "block") {
          throw new AppError(403, "This User is blocked");
     }
     // <- check the  password ok or not ->
     const isPassIsOk = await bcrypt.compare(payload?.password, isUserExist?.password)

     if (!isPassIsOk) {
          throw new AppError(401, "This password  is invalid");
     }

     const user = {
          id: isUserExist?._id,
          role: isUserExist?.role,
          email: isUserExist?.email
     }

     const accessToken = jwt.sign(user, config.jwt_secret as string, { expiresIn: "365d" })
     const refreshToken = jwt.sign(user, config.jwt_secret as string, { expiresIn: "365d" })

     return {
          accessToken,
          refreshToken
     }



}
const googleLogin = async (payload: Pick<TCreateProfile, "email" | "password" | "FullName" | "imageUrl">) => {




     const result = await userModel.create(payload)

     const user = {
          id: result?._id,
          role: result?.role,
          email: result?.email
     }


     const accessToken = jwt.sign(user, config.jwt_secret as string, { expiresIn: "365d" })
     const refreshToken = jwt.sign(user, config.jwt_secret as string, { expiresIn: "365d" })

     return {
          result,
          accessToken,
          refreshToken
     }



}
const appleLogin = async (payload: Pick<TCreateProfile, "email" | "password" | "FullName" | "imageUrl">) => {




     const result = await userModel.create(payload)

     const user = {
          id: result?._id,
          role: result?.role,
          email: result?.email
     }


     const accessToken = jwt.sign(user, config.jwt_secret as string, { expiresIn: "365d" })
     const refreshToken = jwt.sign(user, config.jwt_secret as string, { expiresIn: "365d" })

     return {
          result,
          accessToken,
          refreshToken
     }



}

const updateStatusInDB = async (id: string, payload: Record<string, unknown>) => {
     const isUserExist = await userModel.findById(id)
     if (!isUserExist) {
          throw new AppError(404, "This user Not Found");

     }
     const result = await userModel.findByIdAndUpdate(id, payload, { new: true })
     return result

}
const deletePlayerFromDB = async (id: string) => {
     const isUserExist = await userModel.findById(id)
     if (!isUserExist) {
          throw new AppError(404, "This user Not Found");

     }
     const result = await userModel.findByIdAndDelete(id,  { new: true })
     return result

}
const updateProfileInDB = async (email: string, payload: Record<string, unknown>) => {
     const isUserExist = await userModel.findOne({ email: email })

     if (!isUserExist) {
          throw new AppError(404, "This user Not Found");

     }
     const result = await userModel.findOneAndUpdate({ email: email }, payload, { new: true })
     return result
}
const allStudentFromDB = async (query:Record<string,unknown>) => {
     const playerQuery = new QueryBuilder(userModel.find().select("-password"), query).filter().search(["userName","FullName"]).sort()
     const result = await playerQuery.modelQuery
     return result;

}

const getSingleUser = async (id: string) => {
     const result = await userModel.findOne({ email: id }).select("-password")
     return result;
}

const resetRequest = async (payload: Record<string, unknown>) => {
     const isUserExist = await userModel.findOne({ email: payload?.email });

     if (!isUserExist) {
          throw new AppError(404, "This user Not Found");
     }

     if (isUserExist.isBlocked === "block") {
          throw new AppError(403, "You are not authorized");
     }
     const user = {
          id: isUserExist?._id,
          role: isUserExist?.role,
          email: isUserExist?.email
     }

     const resetToken = jwt.sign(user, config.jwt_secret as string, { expiresIn: "30d" })


     const resetUrl = `yourapp://reset-password?token=${resetToken}`;
     // Email template
     const emailHtml = `
       <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
         <h2 style="color: #4CAF50;">Password Reset Request</h2>
         <p>Hello ${isUserExist.FullName},</p>
         <p>We received a request to reset your password. If you didn't make this request, you can ignore this email.</p>
         <p>Otherwise, click the button below to reset your password:</p>
         <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background: #4CAF50; color: #fff; text-decoration: none; font-weight: bold; border-radius: 5px;">
           Reset Now
         </a>
         <p style="margin-top: 20px;">If the button doesn't work, copy and paste this link into your browser:</p>
         <p>Thank you,<br>Top Top Team</p>
       </div>
     `;

     await emailSender(payload.email as string, emailHtml, "Reset your password");
     return {}
};


export const resetPassword = async (payload: { email: string, password: string  }) => {

     const isPlayerIsExist = await userModel.findOne({email:payload.email})
     if (!isPlayerIsExist) {
          throw new AppError(404, "User not found");
     }

     const hashedPassword = await bcrypt.hash(payload.password, Number(config.salt_round));


     const updatedUser = await userModel.findOneAndUpdate(
          { email: payload.email },
          { $set: { password: hashedPassword } },
          { new: true }
     ).select("-password");


     if (!updatedUser) {
          throw new AppError(404, "User not found");
     }


     return updatedUser;
};
export const changePassword = async (payload: { oldPassword: string, newPassword: string }, userId:string) => {
     

     const isUserExist = await userModel.findById(userId)
     if (!isUserExist) {
          throw new AppError(404, "This user Not Found");

     }

     const isPassIsOk = await bcrypt.compare(payload?.oldPassword, isUserExist?.password)

     if (!isPassIsOk) {
          throw new AppError(401, "This password  is invalid");
     }

     const hashedPassword = await bcrypt.hash(payload.newPassword, Number(config.salt_round));


     const updatedUser = await userModel.findByIdAndUpdate(userId,{password:hashedPassword},{new:true})


     if (!updatedUser) {
          throw new AppError(404, "User not found");
     }


     return updatedUser;
};


const playerProfile =async(id:string)=>{
     const result = await userModel.findById(id) 
     const allLobbies = await LobbyModel.find({
          $or: [
               { "team1.players.playerId": id },
               { "team2.players.playerId": id },
               { "defaultTeam1.players.playerId": id },
               { "defaultTeam2.players.playerId": id },
          ],
     }).populate("team1.teamId")
     .populate("team2.teamId") 

     
     return {
          result ,
          allLobbies
     }
}




export const authService = {
     createUserIntoDB,
     loginUser,
     updateStatusInDB,
     updateProfileInDB,
     allStudentFromDB,
     getSingleUser,
     resetRequest,
     resetPassword,
     googleLogin,
     appleLogin,
     changePassword,
     playerProfile,
     deletePlayerFromDB
}