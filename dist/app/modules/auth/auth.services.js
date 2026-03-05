import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { userModel } from './auth.model.js';
import AppError from '../../Error/AppError.js';
import config from '../../config/index.js';
import QueryBuilder from '../../builder/QueryBuilder.js';
import { LobbyModel } from '../Lobby/lobby.model.js';
import OtpModel from './auth.otpmodel.js';
import emailSender from '../../utils/sendEmail.js';
import { TeamModel } from '../Team/team.model.js';
import { sendOTP } from '../../utils/twilio.js';
import { MatchModel } from '../TournamentMatch/match.model.js';
const createUserIntoDB = async (payload) => {
    const isUserAlreadyExist = await userModel.findOne({ email: payload?.email });
    if (isUserAlreadyExist) {
        throw new AppError(401, "This user Already exists");
    }
    payload.password = await bcrypt.hash(payload.password, Number(config.salt_round));
    // const result1 = await sendOTP(payload.mobile!, { channel: 'sms' });
    // console.log(result1,"otp sending")
    const result = await userModel.create(payload);
    return result;
};
const loginUser = async (payload) => {
    const isUserExist = await userModel.findOne({ email: payload.email });
    if (!isUserExist) {
        throw new AppError(404, "This user Not Found");
    }
    if (isUserExist.isBlocked === "block") {
        throw new AppError(403, "This User is blocked");
    }
    // <- check the  password ok or not ->
    const isPassIsOk = await bcrypt.compare(payload?.password, isUserExist?.password);
    if (!isPassIsOk) {
        throw new AppError(401, "This password  is invalid");
    }
    const user = {
        id: isUserExist?._id,
        role: isUserExist?.role,
        email: isUserExist?.email
    };
    const accessToken = jwt.sign(user, config.jwt_secret, { expiresIn: "365d" });
    const refreshToken = jwt.sign(user, config.jwt_secret, { expiresIn: "365d" });
    return {
        accessToken,
        refreshToken,
        role: isUserExist?.role
    };
};
const googleLogin = async (payload) => {
    const isUserExist = await userModel.findOne({ email: payload.email });
    let userData;
    let result = null;
    if (!isUserExist) {
        result = await userModel.create(payload);
        userData = {
            id: result?._id,
            role: result?.role,
            email: result?.email,
        };
    }
    else {
        userData = {
            id: isUserExist?._id,
            role: isUserExist?.role,
            email: isUserExist?.email,
        };
    }
    const accessToken = jwt.sign(userData, config.jwt_secret, { expiresIn: "365d" });
    const refreshToken = jwt.sign(userData, config.jwt_secret, { expiresIn: "365d" });
    return {
        user: userData,
        result,
        accessToken,
        refreshToken
    };
};
const appleLogin = async (payload) => {
    const result = await userModel.create(payload);
    const user = {
        id: result?._id,
        role: result?.role,
        email: result?.email
    };
    const accessToken = jwt.sign(user, config.jwt_secret, { expiresIn: "365d" });
    const refreshToken = jwt.sign(user, config.jwt_secret, { expiresIn: "365d" });
    return {
        result,
        accessToken,
        refreshToken
    };
};
const updateStatusInDB = async (id, payload) => {
    const isUserExist = await userModel.findById(id);
    if (!isUserExist) {
        throw new AppError(404, "This user Not Found");
    }
    const result = await userModel.findByIdAndUpdate(id, payload, { new: true });
    return result;
};
const deletePlayerFromDB = async (id) => {
    const isUserExist = await userModel.findById(id);
    if (!isUserExist) {
        throw new AppError(404, "This user Not Found");
    }
    const result = await userModel.findByIdAndDelete(id, { new: true });
    return result;
};
const updateProfileInDB = async (email, payload) => {
    const isUserExist = await userModel.findOne({ email: email });
    if (!isUserExist) {
        throw new AppError(404, "This user Not Found");
    }
    const result = await userModel.findOneAndUpdate({ email: email }, payload, { new: true });
    return result;
};
const allStudentFromDB = async (query) => {
    const playerQuery = new QueryBuilder(userModel.find().select("-password"), query).filter().search(["userName", "FullName"]).sort();
    const result = await playerQuery.modelQuery;
    return result;
};
const getSingleUser = async (email) => {
    const user = await userModel.findOne({ email }).select("-password");
    if (!user)
        return null;
    const myJoinedTeam = await TeamModel.find({
        players: { $in: [user._id] }
    });
    const hasOwnTeam = await TeamModel.findOne({ teamOwner: user._id });
    return {
        ...user.toObject(),
        myJoinedTeam,
        hasOwnTeam: hasOwnTeam
    };
};
const resetRequest = async (payload) => {
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
    };
    const createdOtp = await OtpModel.create(userOtp);
    const emailHtml = `
        <p>Hello ${isUserExist.FullName},</p>
        <p>Your password reset OTP is: <strong>${otp}</strong></p>
        <p>This OTP is valid for 5 minutes.</p>
    `;
    try {
        await emailSender(payload.email, "Password Reset OTP", emailHtml);
        console.log("OTP Email sent successfully");
    }
    catch (error) {
        // Delete the OTP if email fails
        await OtpModel.findByIdAndDelete(createdOtp._id);
        console.error("Error sending OTP email:", error);
        throw new AppError(500, "Failed to send OTP. Please try again later.");
    }
};
export const resetPassword = async (payload) => {
    const otpExist = await OtpModel.findOne({ otp: payload.otp });
    if (!otpExist)
        throw new AppError(404, "OTP not found");
    if (otpExist.otp !== payload.otp)
        throw new AppError(400, "Invalid OTP");
    if (Date.now() > +otpExist.otpExpiry)
        throw new AppError(400, "OTP expired");
    const hashedPassword = await bcrypt.hash(payload.password, Number(config.salt_round));
    const updatedUser = await userModel.findOneAndUpdate({ email: otpExist.email }, { $set: { password: hashedPassword } }, { new: true }).select("-password");
    if (updatedUser) {
        await OtpModel.findByIdAndDelete(otpExist._id);
    }
    if (!updatedUser) {
        throw new AppError(404, "User not found");
    }
    return updatedUser;
};
export const changePassword = async (payload, userId) => {
    const isUserExist = await userModel.findById(userId);
    if (!isUserExist) {
        throw new AppError(404, "This user Not Found");
    }
    const isPassIsOk = await bcrypt.compare(payload?.oldPassword, isUserExist?.password);
    if (!isPassIsOk) {
        throw new AppError(401, "This password  is invalid");
    }
    const hashedPassword = await bcrypt.hash(payload.newPassword, Number(config.salt_round));
    const updatedUser = await userModel.findByIdAndUpdate(userId, { password: hashedPassword }, { new: true });
    if (!updatedUser) {
        throw new AppError(404, "User not found");
    }
    return updatedUser;
};
const calculatePlayerStats = (lobbies, playerId) => {
    const matchesPlayed = lobbies.length;
    let totalGoals = 0;
    let totalAssists = 0;
    let totalSaves = 0;
    let cleanSheets = 0;
    let wins = 0;
    lobbies.forEach(lobby => {
        // Player কোন team এ ছিল এবং সেই team এর goal কত
        let playerTeamGoal = null;
        let opponentTeamGoal = null;
        // teams match (team1/team2)
        const teamSides = [
            { players: lobby.team1?.players, myGoal: lobby.goalTeam2, oppGoal: lobby.goalTeam1 },
            // team2 জিতলে goalTeam2 > goalTeam1
            { players: lobby.team2?.players, myGoal: lobby.goalTeam2, oppGoal: lobby.goalTeam1 },
        ];
        // solo match (defaultTeam1/defaultTeam2)
        const defaultSides = [
            { players: lobby.defaultTeam1?.players, myGoal: lobby.goalTeam1, oppGoal: lobby.goalTeam2 },
            { players: lobby.defaultTeam2?.players, myGoal: lobby.goalTeam2, oppGoal: lobby.goalTeam1 },
        ];
        const allSides = [
            { players: lobby.team1?.players, myGoal: lobby.goalTeam2, oppGoal: lobby.goalTeam1 },
            { players: lobby.team2?.players, myGoal: lobby.goalTeam2, oppGoal: lobby.goalTeam1 },
            { players: lobby.defaultTeam1?.players, myGoal: lobby.goalTeam1, oppGoal: lobby.goalTeam2 },
            { players: lobby.defaultTeam2?.players, myGoal: lobby.goalTeam2, oppGoal: lobby.goalTeam1 },
        ];
        allSides.forEach(({ players, myGoal, oppGoal }) => {
            if (!players)
                return;
            const player = players.find((p) => p.playerId?.toString() === playerId);
            if (player) {
                totalGoals += player.goal || 0;
                totalAssists += player.assists || 0;
                totalSaves += player.save || 0;
                // player এর team এর goal track
                playerTeamGoal = myGoal;
                opponentTeamGoal = oppGoal;
                // clean sheet: goalkeeper যদি কোনো goal না খায়
                if (oppGoal === 0 && (player.save !== undefined)) {
                    cleanSheets++;
                }
            }
        });
        // player এর team জিতেছে কিনা
        if (playerTeamGoal !== null && opponentTeamGoal !== null) {
            if (playerTeamGoal > opponentTeamGoal)
                wins++;
        }
    });
    return {
        matchesPlayed,
        goalsPerGame: matchesPlayed ? +(totalGoals / matchesPlayed).toFixed(1) : 0,
        assistsPerGame: matchesPlayed ? +(totalAssists / matchesPlayed).toFixed(1) : 0,
        savesPerGame: matchesPlayed ? +(totalSaves / matchesPlayed).toFixed(1) : 0,
        cleanSheets,
        winRatio: matchesPlayed ? Math.round((wins / matchesPlayed) * 100) : 0,
    };
};
const collectLobbyMedia = (lobbies) => {
    const mediaSet = new Set();
    lobbies.forEach(lobby => {
        if (Array.isArray(lobby.media)) {
            lobby.media.forEach((m) => {
                if (m)
                    mediaSet.add(m);
            });
        }
    });
    return Array.from(mediaSet);
};
const playerProfile = async (id) => {
    const result = await userModel.findById(id);
    // ✅ Lobby matches (solo + teams) - সব যেখানে player join করেছে
    const allLobbies = await LobbyModel.find({
        $or: [
            { "team1.players.playerId": id },
            { "team2.players.playerId": id },
            { "defaultTeam1.players.playerId": id },
            { "defaultTeam2.players.playerId": id },
        ],
    })
        .populate("team1.teamId")
        .populate("team2.teamId");
    // ✅ Tournament matches - আলাদা query
    const tournamentMatches = await MatchModel.find({
        $or: [
            { "teamAPlayers.playerId": id },
            { "teamBPlayers.playerId": id },
        ],
        status: "Completed",
    }).populate("tournament teamA teamB");
    const lobbyStats = calculatePlayerStats(allLobbies, id);
    const media = collectLobbyMedia(allLobbies);
    return {
        result,
        stats: lobbyStats,
        media,
        allLobbies,
        tournamentMatches,
    };
};
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
};
//# sourceMappingURL=auth.services.js.map