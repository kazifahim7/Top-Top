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
    console.log(isUserExist);
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
export const authService = {
    createUserIntoDB,
    loginUser,
    updateStatusInDB,
    updateProfileInDB,
    allStudentFromDB,
    getSingleUser
};
//# sourceMappingURL=auth.services.js.map