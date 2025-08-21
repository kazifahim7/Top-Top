import { ZodError } from 'zod';
const handleZodError = (err) => {
    const errorSources = err.issues.map((issue) => {
        return {
            path: issue === null || issue === void 0 ? void 0 : issue.path[issue.path.length - 1],
            message: issue.message,
        };
    });
    const statusCode = 400;
    return {
        statusCode,
        message: 'Validation Error',
        errorSources,
    };
};
export default handleZodError;
//# sourceMappingURL=ZodError.js.map