import catchAsync from "../utils/catcgAsync.js";
import { ZodType } from "zod";
const validateRequest = (schema) => {
    return catchAsync(async (req, res, next) => {
        await schema.parseAsync({
            body: req.body,
            cookies: req.cookies
        });
        next();
    });
};
export default validateRequest;
//# sourceMappingURL=validatonRequest.js.map