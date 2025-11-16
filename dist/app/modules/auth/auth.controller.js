import {} from "express";
import catchAsync from "../../utils/catcgAsync.js";
import { authService } from "./auth.services.js";
import { getLocalImageURL, uploadToS3 } from "../../utils/multer.js";
const createUser = catchAsync(async (req, res) => {
    const data = req.body;
    const imageFiles = req.files.images || [];
    for (const file of imageFiles) {
        const url = await uploadToS3(file);
        data.imageUrl = url;
    }
    const result = await authService.createUserIntoDB(data);
    res.status(200).json({
        success: true,
        message: "Player registered successfully",
        data: {
            _id: result?._id,
            fullName: result?.FullName,
            email: result?.email
        }
    });
});
const logInUser = catchAsync(async (req, res) => {
    const data = req.body;
    const result = await authService.loginUser(data);
    res.status(200).json({
        success: true,
        message: "User login successfully",
        data: result
    });
});
const googleLogin = catchAsync(async (req, res) => {
    const data = req.body;
    const result = await authService.googleLogin(data);
    res.status(200).json({
        success: true,
        message: "Google login successfully",
        data: result
    });
});
const appleLogin = catchAsync(async (req, res) => {
    const data = req.body;
    const result = await authService.appleLogin(data);
    res.status(200).json({
        success: true,
        message: "Apple login successfully",
        data: result
    });
});
const resetRequest = catchAsync(async (req, res) => {
    const data = req.body;
    const result = await authService.resetRequest(data);
    res.status(200).json({
        success: true,
        message: "Check your Email",
        data: result
    });
});
const updateStatus = catchAsync(async (req, res) => {
    const id = req.params.id;
    const data = req.body;
    const result = await authService.updateStatusInDB(id, data);
    res.status(200).json({
        success: true,
        message: "User status update successfully successfully",
        data: result
    });
});
const deletePlayer = catchAsync(async (req, res) => {
    const id = req.params.id;
    const result = await authService.deletePlayerFromDB(id);
    res.status(200).json({
        success: true,
        message: "deleted successfully successfully",
        data: result
    });
});
const updateProfile = catchAsync(async (req, res) => {
    const id = req.params?.email;
    const data = req.body;
    const imageFiles = req.files.images || [];
    for (const file of imageFiles) {
        const url = await uploadToS3(file);
        data.imageUrl = url;
    }
    const result = await authService.updateProfileInDB(id, data);
    res.status(200).json({
        success: true,
        message: "User  update successfully ",
        data: result
    });
});
const allUsers = catchAsync(async (req, res) => {
    const result = await authService.allStudentFromDB(req.query);
    res.status(200).json({
        success: true,
        message: "User is retrieved successfully ",
        data: result
    });
});
const singleUser = catchAsync(async (req, res) => {
    const result = await authService.getSingleUser(req?.params?.email);
    res.status(200).json({
        success: true,
        message: "User is retrieved successfully ",
        data: result
    });
});
const resetPassword = catchAsync(async (req, res) => {
    const result = await authService.resetPassword(req?.body);
    res.status(200).json({
        success: true,
        message: "Password successfully updated ",
        data: result
    });
});
const changePassword = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const result = await authService.changePassword(req?.body, userId);
    res.status(200).json({
        success: true,
        message: "Password successfully updated ",
        data: result
    });
});
const playerProfile = catchAsync(async (req, res) => {
    const userId = req.params.id;
    const result = await authService.playerProfile(userId);
    res.status(200).json({
        success: true,
        message: "Player data retrieved successfully ",
        data: result
    });
});
export const authController = {
    createUser,
    logInUser,
    updateStatus,
    updateProfile,
    allUsers,
    singleUser,
    resetRequest,
    resetPassword,
    googleLogin,
    appleLogin,
    changePassword,
    playerProfile,
    deletePlayer
};
//# sourceMappingURL=auth.controller.js.map