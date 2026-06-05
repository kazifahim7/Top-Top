import crypto from 'crypto'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

import { userModel } from './auth.model.js';
import AppError from '../../Error/AppError.js';
import config from '../../config/index.js';

import type { TCreateProfile } from './auth.interface.js';
import QueryBuilder from '../../builder/QueryBuilder.js';
import { LobbyModel } from '../Lobby/lobby.model.js';

import OtpModel from './auth.otpmodel.js';
import emailSender from '../../utils/sendEmail.js';
import { TeamModel } from '../Team/team.model.js';
import { isValidPhone, sendOTP, verifyOTP } from '../../utils/twilio.js';
import { MatchModel } from '../TournamentMatch/match.model.js';
import mongoose from 'mongoose';


// ─── Normalisation helpers ────────────────────────────────────────────────────

const normalizeMobile = (mobile: unknown) => {
     if (typeof mobile !== "string") return "";
     const normalizedMobile = mobile.trim();
     if (!normalizedMobile) return "";
     return normalizedMobile.startsWith("+") ? normalizedMobile : `+${normalizedMobile}`;
}

const normalizeStringArray = (value: unknown) => {
     if (!Array.isArray(value)) return [];
     return value
          .map((item) => typeof item === "string" ? item.trim() : "")
          .filter((item) => item.length > 0);
}

const normalizeOptionalString = (value: unknown) => {
     return typeof value === "string" ? value.trim() : "";
}

const removeClientControlledPhoneVerificationFields = (payload: Record<string, unknown>) => {
     const sanitizedPayload = { ...payload };
     delete sanitizedPayload.isMobileVerified;
     delete sanitizedPayload.mobileVerifiedAt;
     return sanitizedPayload;
}

// ─── F-02 FIX: Explicit allowlist for user-editable profile fields ────────────
/**
 * Only fields in this set may be submitted by an authenticated user via the
 * public profile-update endpoint.  Any other key — role, isBlocked, password,
 * rating, match statistics, etc. — is silently dropped before the DB write.
 */
const PROFILE_UPDATE_ALLOWLIST = new Set([
     "FullName",
     "userName",
     "mobile",
     "imageUrl",
     "nationality",
     "dominantFoot",
     "gameMode",
     "preferredAreas",
     "socialProfile",
     "playingDays",
     "position",
     "age",
     "matchPosition",
]);

const buildProfileUpdatePayload = (raw: Record<string, unknown>): Record<string, unknown> => {
     const safe: Record<string, unknown> = {};
     for (const key of PROFILE_UPDATE_ALLOWLIST) {
          if (Object.prototype.hasOwnProperty.call(raw, key)) {
               safe[key] = raw[key];
          }
     }
     return safe;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const assertMobileCanBeVerified = async (mobile: string, userId: string) => {
     const existingVerifiedUser = await userModel.findOne({
          _id: { $ne: userId },
          mobile,
          isMobileVerified: true,
     });

     if (existingVerifiedUser) {
          throw new AppError(409, "This phone number is already verified by another account");
     }
}


// ─── Auth services ────────────────────────────────────────────────────────────

const createUserIntoDB = async (payload: TCreateProfile) => {
     const isUserAlreadyExist = await userModel.findOne({ email: payload?.email })
     if (isUserAlreadyExist) {
          throw new AppError(401, "This user Already exists");
     }

     const hashedPassword = await bcrypt.hash(payload.password, Number(config.salt_round))

     const position = normalizeStringArray(payload.position);

     // F-01 FIX: role and isBlocked are hard-coded constants — never sourced from
     // the request payload, so a caller cannot self-assign admin / organizer.
     const sanitizedPayload = {
          FullName: payload.FullName,
          userName: normalizeOptionalString(payload.userName),
          email: payload.email,
          password: hashedPassword,
          mobile: normalizeMobile(payload.mobile),
          imageUrl: payload.imageUrl,
          role: "player" as const,        // ← always forced; never from payload
          isBlocked: "active" as const,   // ← always forced; never from payload
          isMobileVerified: false,
          mobileVerifiedAt: null,
          nationality: normalizeOptionalString(payload.nationality),
          dominantFoot: normalizeOptionalString(payload.dominantFoot),
          gameMode: normalizeOptionalString(payload.gameMode),
          preferredAreas: normalizeStringArray(payload.preferredAreas),
          socialProfile: normalizeStringArray(payload.socialProfile),
          playingDays: normalizeStringArray(payload.playingDays),
          position,
          age: normalizeOptionalString(payload.age),
          matchPosition: normalizeOptionalString(payload.matchPosition) || position[0] || "",
     }

     const result = await userModel.create(sanitizedPayload)
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

     const isPassIsOk = await bcrypt.compare(payload?.password, isUserExist?.password)
     if (!isPassIsOk) {
          throw new AppError(401, "This password is invalid");
     }

     const user = {
          id: isUserExist?._id,
          role: isUserExist?.role,
          email: isUserExist?.email
     }

     const accessToken = jwt.sign(user, config.jwt_secret as string, { expiresIn: "15d" })
     const refreshToken = jwt.sign(user, config.jwt_secret as string, { expiresIn: "30d" })

     return {
          accessToken,
          refreshToken,
          role: isUserExist?.role,
          userid: isUserExist._id,
          mobile: isUserExist?.mobile,
          isMobileVerified: Boolean(isUserExist?.isMobileVerified),
          mobileVerifiedAt: isUserExist?.mobileVerifiedAt ?? null,
     }
}

const googleLogin = async (
     payload: Pick<TCreateProfile, "email" | "password" | "FullName" | "imageUrl">
) => {
     const isUserExist = await userModel.findOne({ email: payload.email })

     let userData;
     let result = null;

     if (!isUserExist) {
          // F-01 FIX: role and isBlocked are hard-coded — never sourced from the
      
          const sanitizedPayload = {
               FullName: payload.FullName,
               email: payload.email,
               imageUrl: payload.imageUrl,
               role: "player" as const,       // ← always forced
               isBlocked: "active" as const,  // ← always forced
          }

          result = await userModel.create(sanitizedPayload)

          userData = {
               id: result?._id,
               role: result?.role,
               email: result?.email,
               isMobileVerified: Boolean(result?.isMobileVerified),
               mobileVerifiedAt: result?.mobileVerifiedAt ?? null,
          }
     } else {
          if (isUserExist.isBlocked === "block") {
               throw new AppError(403, "Your account has been blocked");
          }

          userData = {
               id: isUserExist?._id,
               role: isUserExist?.role,
               email: isUserExist?.email,
               isMobileVerified: Boolean(isUserExist?.isMobileVerified),
               mobileVerifiedAt: isUserExist?.mobileVerifiedAt ?? null,
          }
     }

     const accessToken = jwt.sign(userData, config.jwt_secret as string, { expiresIn: "15d" })
     const refreshToken = jwt.sign(userData, config.jwt_secret as string, { expiresIn: "30d" })

     return {
          user: userData,
          result,
          accessToken,
          refreshToken
     }
}

const appleLogin = async (
     payload: Pick<TCreateProfile, "email" | "password" | "FullName" | "imageUrl">
) => {
     if (!payload.email) {
          throw new AppError(400, "Email is required for Apple Sign In");
     }

     const isUserExist = await userModel.findOne({ email: payload.email });

     let userData;
     let result = null;

     if (!isUserExist) {
          // F-01 FIX: role and isBlocked are hard-coded — never sourced from the
          // Apple identity token payload, which is partially user-controlled data.
          const sanitizedPayload = {
               FullName: payload.FullName || "Apple User",
               email: payload.email,
               imageUrl: payload.imageUrl || "",
               role: "player" as const,       // ← always forced
               isBlocked: "active" as const,  // ← always forced
               password: Math.random().toString(36).slice(-10),
          };

          result = await userModel.create(sanitizedPayload);

          userData = {
               id: result?._id,
               role: result?.role,
               email: result?.email,
               isMobileVerified: Boolean(result?.isMobileVerified),
               mobileVerifiedAt: result?.mobileVerifiedAt ?? null,
          };
     } else {
          if (isUserExist.isBlocked === "block") {
               throw new AppError(403, "Your account has been blocked");
          }

          // Only FullName and imageUrl may be updated from the Apple payload —
          // both are cosmetic profile fields, not privilege-bearing fields.
          if (payload.FullName || payload.imageUrl) {
               await userModel.findByIdAndUpdate(isUserExist._id, {
                    ...(payload.FullName && { FullName: payload.FullName }),
                    ...(payload.imageUrl && { imageUrl: payload.imageUrl }),
               });
          }

          userData = {
               id: isUserExist?._id,
               role: isUserExist?.role,
               email: isUserExist?.email,
               isMobileVerified: Boolean(isUserExist?.isMobileVerified),
               mobileVerifiedAt: isUserExist?.mobileVerifiedAt ?? null,
          };
     }

     const accessToken = jwt.sign(userData, config.jwt_secret as string, { expiresIn: "15d" });
     const refreshToken = jwt.sign(userData, config.jwt_secret as string, { expiresIn: "30d" });

     return {
          user: userData,
          result,
          accessToken,
          refreshToken,
     };
};

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

     // F-02 FIX: Apply allowlist FIRST so only permitted fields survive.
     // This replaces the previous approach of stripping a handful of known-bad
     // fields, which is fragile — any new privileged field added to the model
     // would be exposed automatically.  An allowlist is closed by default.
     const allowlistedPayload = buildProfileUpdatePayload(payload);

     // Strip server-controlled phone-verification flags (defence-in-depth; the
     // allowlist above already excludes these, but keep it explicit).
     const sanitizedPayload = removeClientControlledPhoneVerificationFields(allowlistedPayload);

     const hasMobileUpdate = Object.prototype.hasOwnProperty.call(sanitizedPayload, "mobile");

     if (hasMobileUpdate) {
          if (typeof sanitizedPayload.mobile !== "string") {
               throw new AppError(400, "Mobile number must be a string");
          }

          const normalizedMobile = normalizeMobile(sanitizedPayload.mobile);
          sanitizedPayload.mobile = normalizedMobile;

          if (normalizedMobile !== normalizeMobile(isUserExist.mobile)) {
               sanitizedPayload.isMobileVerified = false;
               sanitizedPayload.mobileVerifiedAt = null;
          }
     }

     const result = await userModel.findOneAndUpdate(
          { email: email },
          sanitizedPayload,
          { new: true }
     ).select("-password")

     if (!result) return result;

     const resultObject = result.toObject();
     return {
          ...resultObject,
          isMobileVerified: Boolean(resultObject.isMobileVerified),
          mobileVerifiedAt: resultObject.mobileVerifiedAt ?? null,
     };
}

const allStudentFromDB = async (query: Record<string, unknown>) => {
     const playerQuery = new QueryBuilder(
          userModel.find().select("-password"),
          query
     ).filter().search(["userName", "FullName"]).sort()
     const result = await playerQuery.modelQuery
     return result;
}

const getSingleUser = async (email: string) => {
     const user = await userModel.findOne({ email }).select("-password");
     if (!user) return null;

     const myJoinedTeam = await TeamModel.find({
          players: { $in: [user._id] }
     });

     const hasOwnTeam = await TeamModel.findOne({ teamOwner: user._id })
     const userObject = user.toObject();

     return {
          ...userObject,
          isMobileVerified: Boolean(userObject.isMobileVerified),
          mobileVerifiedAt: userObject.mobileVerifiedAt ?? null,
          myJoinedTeam,
          hasOwnTeam: hasOwnTeam
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

     const rawOtp = crypto.randomInt(1000, 10000).toString();
     const userOtp = {
          id: isUserExist?._id,
          role: isUserExist?.role,
          email: isUserExist?.email,
          otp: rawOtp,
          otpExpiry: Date.now() + 5 * 60 * 1000
     }

     const createdOtp = await OtpModel.create(userOtp);

     const emailHtml = `
        <p>Hello ${isUserExist.FullName},</p>
        <p>Your password reset OTP is: <strong>${rawOtp}</strong></p>
        <p>This OTP is valid for 5 minutes.</p>
    `;

     try {
          await emailSender(payload.email as string, "Password Reset OTP", emailHtml);
          console.log("OTP Email sent successfully");
     } catch (error) {
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

export const changePassword = async (
     payload: { oldPassword: string, newPassword: string },
     userId: string
) => {
     const isUserExist = await userModel.findById(userId)
     if (!isUserExist) {
          throw new AppError(404, "This user Not Found");
     }

     const isPassIsOk = await bcrypt.compare(payload?.oldPassword, isUserExist?.password)
     if (!isPassIsOk) {
          throw new AppError(401, "This password is invalid");
     }

     const hashedPassword = await bcrypt.hash(payload.newPassword, Number(config.salt_round));
     const updatedUser = await userModel.findByIdAndUpdate(
          userId,
          { password: hashedPassword },
          { new: true }
     )

     if (!updatedUser) {
          throw new AppError(404, "User not found");
     }

     return updatedUser;
};

const sendPhoneOtp = async (userId: string) => {
     const isUserExist = await userModel.findById(userId)
     if (!isUserExist) {
          throw new AppError(404, "This user Not Found");
     }
     if (isUserExist.isBlocked === "block") {
          throw new AppError(403, "This User is blocked");
     }

     const mobile = normalizeMobile(isUserExist.mobile);
     if (!mobile) {
          throw new AppError(400, "Mobile number is required before phone verification");
     }
     if (!isValidPhone(mobile)) {
          throw new AppError(400, "Invalid phone number. Use E.164 format e.g. +201001234567");
     }

     await assertMobileCanBeVerified(mobile, userId);

     const result = await sendOTP(mobile, { channel: "sms" });
     if (!result.success) {
          const statusCode = result.status === "invalid_phone" ? 400 : 500;
          throw new AppError(statusCode, result.error);
     }

     return {
          status: result.status,
          channel: result.channel,
          to: result.to,
          isMobileVerified: Boolean(isUserExist.isMobileVerified),
     };
}

const verifyPhoneOtp = async (userId: string, payload: { code?: string | number }) => {
     const code = String(payload?.code ?? "").trim();
     if (!code) {
          throw new AppError(400, "OTP code is required");
     }

     const isUserExist = await userModel.findById(userId)
     if (!isUserExist) {
          throw new AppError(404, "This user Not Found");
     }
     if (isUserExist.isBlocked === "block") {
          throw new AppError(403, "This User is blocked");
     }

     const mobile = normalizeMobile(isUserExist.mobile);
     if (!mobile) {
          throw new AppError(400, "Mobile number is required before phone verification");
     }
     if (!isValidPhone(mobile)) {
          throw new AppError(400, "Invalid phone number. Use E.164 format e.g. +201001234567");
     }

     await assertMobileCanBeVerified(mobile, userId);

     const result = await verifyOTP(mobile, code);
     if (!result.success) {
          const statusCode = result.status === "failed" ? 500 : 400;
          throw new AppError(statusCode, result.error);
     }

     await assertMobileCanBeVerified(mobile, userId);

     const updatedUser = await userModel.findByIdAndUpdate(
          userId,
          {
               mobile,
               isMobileVerified: true,
               mobileVerifiedAt: new Date(),
          },
          { new: true }
     ).select("-password");

     if (!updatedUser) {
          throw new AppError(404, "User not found");
     }

     return updatedUser;
}

const calculatePlayerStats = (lobbies: any[], tournamentMatches: any[], playerId: string) => {
     let totalGoals = 0;
     let totalAssists = 0;
     let totalSaves = 0;
     let cleanSheets = 0;
     let wins = 0;

     lobbies.forEach(lobby => {
          let playerTeamGoal: number | null = null;
          let opponentTeamGoal: number | null = null;

          const allSides = [
               { players: lobby.team1?.players, myGoal: lobby.goalTeam1, oppGoal: lobby.goalTeam2, teamType: "team1" },
               { players: lobby.team2?.players, myGoal: lobby.goalTeam2, oppGoal: lobby.goalTeam1, teamType: "team2" },
               { players: lobby.defaultTeam1?.players, myGoal: lobby.goalTeam1, oppGoal: lobby.goalTeam2, teamType: "defaultTeam1" },
               { players: lobby.defaultTeam2?.players, myGoal: lobby.goalTeam2, oppGoal: lobby.goalTeam1, teamType: "defaultTeam2" },
          ];

          allSides.forEach(({ players, myGoal, oppGoal, teamType }) => {
               if (!players) return;
               const player = players.find((p: any) => p.playerId?.toString() === playerId);
               if (player) {
                    totalGoals += player.goal || 0;
                    totalAssists += player.assists || 0;
                    totalSaves += player.save || 0;
                    playerTeamGoal = myGoal;
                    opponentTeamGoal = oppGoal;
                    console.log(`Lobby ${lobby._id}: Player in ${teamType}, Position: ${player.matchPosition}, Opp Goal: ${oppGoal}, Saves: ${player.save}`);
               }
          });

          if (playerTeamGoal !== null && opponentTeamGoal !== null) {
               if (playerTeamGoal > opponentTeamGoal) wins++;
               if (opponentTeamGoal === 0) {
                    cleanSheets++;
                    console.log(`Clean sheet counted for lobby ${lobby._id} (Opponent: 0, Player played)`);
               }
          }
     });

     tournamentMatches.forEach(match => {
          let playerTeamGoal: number | null = null;
          let opponentTeamGoal: number | null = null;

          const playerInTeamA = match.teamAPlayers?.find((p: any) => p.playerId?.toString() === playerId);
          if (playerInTeamA) {
               totalGoals += playerInTeamA.goal || 0;
               totalAssists += playerInTeamA.assists || 0;
               totalSaves += playerInTeamA.save || 0;
               playerTeamGoal = match.scoreA;
               opponentTeamGoal = match.scoreB;
               console.log(`Tournament ${match._id}: Player in Team A, Score: ${match.scoreA}-${match.scoreB}, Saves: ${playerInTeamA.save}`);
          }

          const playerInTeamB = match.teamBPlayers?.find((p: any) => p.playerId?.toString() === playerId);
          if (playerInTeamB) {
               if (!playerInTeamA) {
                    totalGoals += playerInTeamB.goal || 0;
                    totalAssists += playerInTeamB.assists || 0;
                    totalSaves += playerInTeamB.save || 0;
               }
               playerTeamGoal = match.scoreB;
               opponentTeamGoal = match.scoreA;
               console.log(`Tournament ${match._id}: Player in Team B, Score: ${match.scoreB}-${match.scoreA}, Saves: ${playerInTeamB.save}`);
          }

          if (playerTeamGoal !== null && opponentTeamGoal !== null) {
               if (playerTeamGoal > opponentTeamGoal) wins++;
               if (opponentTeamGoal === 0) {
                    cleanSheets++;
                    console.log(`Clean sheet counted for tournament match ${match._id} (Opponent: 0)`);
               }
          }
     });

     const matchesPlayed = lobbies.length + tournamentMatches.length;

     console.log(`\n========== PLAYER STATS SUMMARY ==========`);
     console.log(`Matches Played: ${matchesPlayed}`);
     console.log(`Total Goals: ${totalGoals}`);
     console.log(`Total Assists: ${totalAssists}`);
     console.log(`Total Saves: ${totalSaves}`);
     console.log(`Clean Sheets: ${cleanSheets}`);
     console.log(`Wins: ${wins}`);
     console.log(`Win Ratio: ${matchesPlayed ? Math.round((wins / matchesPlayed) * 100) : 0}%`);
     console.log(`Goals Per Game: ${matchesPlayed ? (totalGoals / matchesPlayed).toFixed(1) : 0}`);
     console.log(`==========================================\n`);

     return {
          matchesPlayed,
          goalsPerGame: matchesPlayed ? +(totalGoals / matchesPlayed).toFixed(1) : 0,
          assistsPerGame: matchesPlayed ? +(totalAssists / matchesPlayed).toFixed(1) : 0,
          savesPerGame: matchesPlayed ? +(totalSaves / matchesPlayed).toFixed(1) : 0,
          cleanSheets,
          winRatio: matchesPlayed ? Math.round((wins / matchesPlayed) * 100) : 0,
     };
};

const collectLobbyMedia = (lobbies: any[]) => {
     const mediaSet = new Set<string>();
     lobbies.forEach(lobby => {
          if (Array.isArray(lobby.media)) {
               lobby.media.forEach((m: string) => { if (m) mediaSet.add(m); });
          }
     });
     return Array.from(mediaSet);
};

const playerProfile = async (id: string) => {
     const result = await userModel.findById(id).select("-cleanSheet -password -__v -match");

     const allLobbies = await LobbyModel.find({
          $or: [
               { "team1.players.playerId": id },
               { "team2.players.playerId": id },
               { "defaultTeam1.players.playerId": id },
               { "defaultTeam2.players.playerId": id },
          ],
     })
          .populate("team1.teamId")
          .populate("team2.teamId")
          .sort({ date: -1 });

     const completedLobbies = allLobbies.filter((lobby) => lobby.lobbyStatus === "completed");

     const tournamentMatches = await MatchModel.find({
          $or: [
               { "teamAPlayers.playerId": id },
               { "teamBPlayers.playerId": id },
          ],
          status: "Completed",
     })
          .populate("tournament teamA teamB")
          .sort({ date: -1 });

     const lobbyStats = calculatePlayerStats(completedLobbies, tournamentMatches, id);
     const media = collectLobbyMedia(allLobbies);
     const playerTeam = await TeamModel.findOne({ teamOwner: id });

     const myJoinedTeam = await TeamModel.find({
          players: { $in: [new mongoose.Types.ObjectId(id)] }
     });

   

     return {
          result,
          stats: {
               matchesPlayed: lobbyStats.matchesPlayed,
               goalsPerGame: lobbyStats.goalsPerGame,
               assistsPerGame: lobbyStats.assistsPerGame,
               savesPerGame: lobbyStats.savesPerGame,
               cleanSheets: lobbyStats.cleanSheets,
               winRatio: lobbyStats.winRatio,
               motm: result?.motm,
               contributionpergame: result?.match
                    ? +(result.contribution! / result.match!).toFixed(1)
                    : 0,
          },
          media,
          allLobbies,
          tournamentMatches,
          playerTeam,
          myJoinedTeam
     };
};

const deleteAccount = async (id: string) => {
     const isUserExist = await userModel.findById(id)
     if (!isUserExist) {
          throw new AppError(404, "This user Not Found");
     }
     const result = await userModel.findByIdAndDelete(id, { new: true })
     return result
}

export const authService = {
     createUserIntoDB,
     deleteAccount,
     loginUser,
     updateStatusInDB,
     updateProfileInDB,
     allStudentFromDB,
     getSingleUser,
     resetRequest,
     resetPassword,
     sendPhoneOtp,
     verifyPhoneOtp,
     googleLogin,
     appleLogin,
     changePassword,
     playerProfile,
     deletePlayerFromDB
}