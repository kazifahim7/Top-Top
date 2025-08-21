var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import catchAsync from "../utils/catcgAsync.js";
import { ZodType } from "zod";
const validateRequest = (schema) => {
    return catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        yield schema.parseAsync({
            body: req.body,
            cookies: req.cookies
        });
        next();
    }));
};
export default validateRequest;
//# sourceMappingURL=validatonRequest.js.map