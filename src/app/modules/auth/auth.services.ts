

import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

import { userModel } from './auth.model.js';
import AppError from '../../Error/AppError.js';
import config from '../../config/index.js';

import type { TCreateProfile } from './auth.interface.js';
import QueryBuilder from '../../builder/QueryBuilder.js';
import { LobbyModel } from '../Lobby/lobby.model.js';
import { email } from 'zod';
import OtpModel from './auth.otpmodel.js';
import emailSender from '../../utils/sendEmail.js';
import { TeamModel } from '../Team/team.model.js';


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
const googleLogin = async (
     payload: Pick<TCreateProfile, "email" | "password" | "FullName" | "imageUrl">
) => {

     const isUserExist = await userModel.findOne({ email: payload.email })

     let userData;
     let result = null;

     if (!isUserExist) {
          result = await userModel.create(payload)

          userData = {
               id: result?._id,
               role: result?.role,
               email: result?.email,
          }
     } else {
          userData = {
               id: isUserExist?._id,
               role: isUserExist?.role,
               email: isUserExist?.email,
          }
     }



     const accessToken = jwt.sign(userData, config.jwt_secret as string, { expiresIn: "365d" })
     const refreshToken = jwt.sign(userData, config.jwt_secret as string, { expiresIn: "365d" })

     return {
          user: userData,
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
     const result = await userModel.findByIdAndDelete(id, { new: true })
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
const allStudentFromDB = async (query: Record<string, unknown>) => {
     const playerQuery = new QueryBuilder(userModel.find().select("-password"), query).filter().search(["userName", "FullName"]).sort()
     const result = await playerQuery.modelQuery
     return result;

}

const getSingleUser = async (email: string) => {
     console.log(email);

     const user = await userModel.findOne({ email }).select("-password");
     if (!user) return null;

     const myJoinedTeam = await TeamModel.find({
          players: { $in: [user._id] } 
     });

     return {
          ...user.toObject(),
          myJoinedTeam
     };
};


const resetRequest = async (payload: Record<string, unknown>) => {
     const isUserExist = await userModel.findOne({ email: payload?.email });

     if (!isUserExist) {
          throw new AppError(404, "This user Not Found");
     }

     if (isUserExist.isBlocked === "block") {
          throw new AppError(403, "You are not authorized");
     }

     const otp = Math.floor(1000 + Math.random() * 9000);
     const userOtp = {
          id: isUserExist?._id,
          role: isUserExist?.role,
          email: isUserExist?.email,
          otp: otp,
          otpExpiry: Date.now() + 5 * 60 * 1000
     }

     const createdOtp = await OtpModel.create(userOtp);

     const emailHtml = `
        <p>Hello ${isUserExist.FullName},</p>
        <p>Your password reset OTP is: <strong>${otp}</strong></p>
        <p>This OTP is valid for 5 minutes.</p>
    `;

     try {
          await emailSender(payload.email as string, "Password Reset OTP", emailHtml);
          console.log("OTP Email sent successfully");
     } catch (error) {
          // Delete the OTP if email fails
          await OtpModel.findByIdAndDelete(createdOtp._id);
          console.error("Error sending OTP email:", error);
          throw new AppError(500, "Failed to send OTP. Please try again later.");
     }
};


export const resetPassword = async (payload: { password: string, otp?: number }) => {


     const otpExist = await OtpModel.findOne({ otp: payload.otp })
     if (!otpExist) throw new AppError(404, "OTP not found");
     if (otpExist.otp !== payload.otp) throw new AppError(400, "Invalid OTP");
     if (Date.now() > +otpExist.otpExpiry) throw new AppError(400, "OTP expired");


     const hashedPassword = await bcrypt.hash(payload.password, Number(config.salt_round));


     const updatedUser = await userModel.findOneAndUpdate(
          { email: otpExist.email },
          { $set: { password: hashedPassword } },
          { new: true }
     ).select("-password");
     if (updatedUser) {
          await OtpModel.findByIdAndDelete(otpExist._id)
     }


     if (!updatedUser) {
          throw new AppError(404, "User not found");
     }


     return updatedUser;
};
export const changePassword = async (payload: { oldPassword: string, newPassword: string }, userId: string) => {


     const isUserExist = await userModel.findById(userId)
     if (!isUserExist) {
          throw new AppError(404, "This user Not Found");

     }

     const isPassIsOk = await bcrypt.compare(payload?.oldPassword, isUserExist?.password)

     if (!isPassIsOk) {
          throw new AppError(401, "This password  is invalid");
     }

     const hashedPassword = await bcrypt.hash(payload.newPassword, Number(config.salt_round));


     const updatedUser = await userModel.findByIdAndUpdate(userId, { password: hashedPassword }, { new: true })


     if (!updatedUser) {
          throw new AppError(404, "User not found");
     }


     return updatedUser;
};


const playerProfile = async (id: string) => {
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
          result,
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