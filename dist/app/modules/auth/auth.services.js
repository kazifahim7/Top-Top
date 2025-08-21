var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { userModel } from './auth.model.js';
import AppError from '../../Error/AppError.js';
import config from '../../config/index.js';
import emailSender from '../../utils/sendEmail.js';
const createUserIntoDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isUserAlreadyExist = yield userModel.findOne({ email: payload === null || payload === void 0 ? void 0 : payload.email });
    if (isUserAlreadyExist) {
        throw new AppError(401, "This user Already exists");
    }
    payload.password = yield bcrypt.hash(payload.password, Number(config.salt_round));
    const result = yield userModel.create(payload);
    return result;
});
const loginUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isUserExist = yield userModel.findOne({ email: payload.email });
    if (!isUserExist) {
        throw new AppError(404, "This user Not Found");
    }
    if (isUserExist.isBlocked === "block") {
        throw new AppError(403, "This User is blocked");
    }
    // <- check the  password ok or not ->
    const isPassIsOk = yield bcrypt.compare(payload === null || payload === void 0 ? void 0 : payload.password, isUserExist === null || isUserExist === void 0 ? void 0 : isUserExist.password);
    if (!isPassIsOk) {
        throw new AppError(401, "This password  is invalid");
    }
    const user = {
        id: isUserExist === null || isUserExist === void 0 ? void 0 : isUserExist._id,
        role: isUserExist === null || isUserExist === void 0 ? void 0 : isUserExist.role,
        email: isUserExist === null || isUserExist === void 0 ? void 0 : isUserExist.email
    };
    const token = jwt.sign(user, config.jwt_secret, { expiresIn: "30d" });
    return {
        token
    };
});
const updateStatusInDB = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isUserExist = yield userModel.findById(id);
    if (!isUserExist) {
        throw new AppError(404, "This user Not Found");
    }
    const result = yield userModel.findByIdAndUpdate(id, payload, { new: true });
    return result;
});
const updateProfileInDB = (email, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isUserExist = yield userModel.findOne({ email: email });
    if (!isUserExist) {
        throw new AppError(404, "This user Not Found");
    }
    const result = yield userModel.findOneAndUpdate({ email: email }, payload, { new: true });
    return result;
});
const allStudentFromDB = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield userModel.find().select("-password");
    return result;
});
const getSingleUser = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield userModel.findOne({ email: id }).select("-password");
    return result;
});
const resetRequest = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isUserExist = yield userModel.findOne({ email: payload === null || payload === void 0 ? void 0 : payload.email });
    if (!isUserExist) {
        throw new AppError(404, "This user Not Found");
    }
    if (isUserExist.isBlocked === "block") {
        throw new AppError(403, "You are not authorized");
    }
    const user = {
        id: isUserExist === null || isUserExist === void 0 ? void 0 : isUserExist._id,
        role: isUserExist === null || isUserExist === void 0 ? void 0 : isUserExist.role,
        email: isUserExist === null || isUserExist === void 0 ? void 0 : isUserExist.email
    };
    const resetToken = jwt.sign(user, config.jwt_secret, { expiresIn: "30d" });
    // Reset password URL
    const resetUrl = `https://yourapp.com/reset-password?token=${resetToken}`;
    // Email template
    const emailHtml = `
       <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
         <h2 style="color: #4CAF50;">Password Reset Request</h2>
         <p>Hello ${isUserExist.firstName},</p>
         <p>We received a request to reset your password. If you didn't make this request, you can ignore this email.</p>
         <p>Otherwise, click the button below to reset your password:</p>
         <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background: #4CAF50; color: #fff; text-decoration: none; font-weight: bold; border-radius: 5px;">
           Reset Now
         </a>
         <p style="margin-top: 20px;">If the button doesn't work, copy and paste this link into your browser:</p>
         <p>${resetUrl}</p>
         <p>Thank you,<br>YourApp Team</p>
       </div>
     `;
    yield emailSender(payload.email, emailHtml, "Reset your password");
    return {};
});
export const resetPassword = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const hashedPassword = yield bcrypt.hash(payload.password, Number(config.salt_round));
    // 2️⃣ Find the user and update password
    const updatedUser = yield userModel.findOneAndUpdate({ email: payload.email }, { $set: { password: hashedPassword } }, { new: true }).select("-password");
    if (!updatedUser) {
        throw new AppError(404, "User not found");
    }
    return updatedUser;
});
export const authService = {
    createUserIntoDB,
    loginUser,
    updateStatusInDB,
    updateProfileInDB,
    allStudentFromDB,
    getSingleUser,
    resetRequest,
    resetPassword
};
//# sourceMappingURL=auth.services.js.map