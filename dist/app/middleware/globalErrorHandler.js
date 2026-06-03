import { ZodError } from 'zod';
import handleZodError from '../Error/ZodError.js';
import AppError from '../Error/AppError.js';
import config from '../config/index.js';
const globalErrorHandler = (err, req, res, next) => {
    let statusCode = 500;
    let message = 'Something went wrong!';
    let errorSources = [
        {
            path: '',
            message: 'Something went wrong',
        },
    ];
    if (err instanceof ZodError) {
        const simplifiedError = handleZodError(err);
        statusCode = simplifiedError?.statusCode;
        message = simplifiedError?.message;
    }
    else if (err instanceof AppError) {
        statusCode = err?.statusCode;
        message = err.message;
        errorSources = [
            {
                path: '',
                message: err?.message,
            },
        ];
    }
    else if (err instanceof Error) {
        message = err.message;
        errorSources = [
            {
                path: '',
                message: err?.message,
            },
        ];
    }
    // Log full error details server-side only
    if (config.node_env !== 'development') {
        console.error(`[ERROR] ${new Date().toISOString()} - ${req.method} ${req.originalUrl}`, err);
    }
    res.status(statusCode).json({
        success: false,
        message,
        errorSources,
        ...(config.node_env === 'development' && { err }),
        stack: config.node_env === 'development' ? err?.stack : null,
    });
};
export default globalErrorHandler;
//# sourceMappingURL=globalErrorHandler.js.map