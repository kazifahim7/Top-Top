import jwt, {} from 'jsonwebtoken';
import config from "../config/index.js";
import AppError from "../Error/AppError.js";
import catchAsync from "../utils/catcgAsync.js";
import { userModel } from "../modules/auth/auth.model.js";
const auth = (...roles) => {
    return catchAsync(async (req, res, next) => {
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
        const isExists = await userModel.findOne({ email: email });
        if (!isExists) {
            throw new AppError(404, "This User Not Found");
        }
        // <- this user is Blocked ->
        if (isExists.isBlocked === "block") {
            throw new AppError(403, "This User is blocked");
        }
        if (!roles.includes(isExists?.role)) {
            throw new AppError(401, 'You are not authorized . please logIn again');
        }
        console.log("hello", role);
        if (role && !roles.includes(role)) {
            throw new AppError(401, 'You are not authorized  .please logIn again');
        }
        req.user = decoded;
        next();
    });
};
export default auth;
//# sourceMappingURL=auth.js.map