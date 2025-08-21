var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import {} from "express";
import catchAsync from "../../utils/catcgAsync.js";
import { authService } from "./auth.services.js";
const createUser = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    const result = yield authService.createUserIntoDB(data);
    res.status(200).json({
        success: true,
        message: "User registered successfully",
        data: {
            _id: result === null || result === void 0 ? void 0 : result._id,
            firstName: result === null || result === void 0 ? void 0 : result.firstName,
            LastName: result === null || result === void 0 ? void 0 : result.lastName,
            email: result === null || result === void 0 ? void 0 : result.email
        }
    });
}));
const logInUser = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    const result = yield authService.loginUser(data);
    res.status(200).json({
        success: true,
        message: "User login successfully",
        data: result
    });
}));
const resetRequest = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    const result = yield authService.resetRequest(data);
    res.status(200).json({
        success: true,
        message: "Check your Email",
        data: result
    });
}));
const updateStatus = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const data = req.body;
    const result = yield authService.updateStatusInDB(id, data);
    res.status(200).json({
        success: true,
        message: "User status update successfully successfully",
        data: result
    });
}));
const updateProfile = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const id = (_a = req.params) === null || _a === void 0 ? void 0 : _a.email;
    const data = req.body;
    const result = yield authService.updateProfileInDB(id, data);
    res.status(200).json({
        success: true,
        message: "User  update successfully ",
        data: result
    });
}));
const allUsers = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield authService.allStudentFromDB();
    res.status(200).json({
        success: true,
        message: "User is retrieved successfully ",
        data: result
    });
}));
const singleUser = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const result = yield authService.getSingleUser((_a = req === null || req === void 0 ? void 0 : req.params) === null || _a === void 0 ? void 0 : _a.email);
    res.status(200).json({
        success: true,
        message: "User is retrieved successfully ",
        data: result
    });
}));
const resetPassword = catchAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield authService.resetPassword(req === null || req === void 0 ? void 0 : req.body);
    res.status(200).json({
        success: true,
        message: "Password successfully updated ",
        data: result
    });
}));
export const authController = {
    createUser,
    logInUser,
    updateStatus,
    updateProfile,
    allUsers,
    singleUser,
    resetRequest,
    resetPassword
};
//# sourceMappingURL=auth.controller.js.map