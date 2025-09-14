var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import jwt, {} from 'jsonwebtoken';
import config from "../config/index.js";
import AppError from "../Error/AppError.js";
import catchAsync from "../utils/catcgAsync.js";
import { userModel } from "../modules/auth/auth.model.js";
const auth = (...roles) => {
    return catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        //  <-get Toke->
        const token = req.headers.authorization;
        if (!token) {
            throw new AppError(401, "Authorization token missing");
        }
        const decoded = jwt.verify(token, config.jwt_secret);
        if (!decoded) {
            throw new AppError(401, "invalid token , please press logout button and login again...");
        }
        const { role, email } = decoded;
        // <- check this user exist in database
        const isExists = yield userModel.findOne({ email: email });
        if (!isExists) {
            throw new AppError(404, "This User Not Found");
        }
        // <- this user is Blocked ->
        if (isExists.isBlocked === "block") {
            throw new AppError(403, "This User is blocked");
        }
        if (!roles.includes(isExists === null || isExists === void 0 ? void 0 : isExists.role)) {
            throw new AppError(401, 'You are not authorized . please logIn again');
        }
        console.log("hello", role);
        if (role && !roles.includes(role)) {
            throw new AppError(401, 'You are not authorized  .please logIn again');
        }
        req.user = decoded;
        next();
    }));
};
export default auth;
//# sourceMappingURL=auth.js.map