/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import type { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import handleZodError from '../Error/ZodError.js';
import AppError from '../Error/AppError.js';
import config from '../config/index.js';






const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {

     //setting default values
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
     } else if (err instanceof AppError ){
          statusCode = err?.statusCode;
          message = err.message;
          errorSources = [
               {
                    path: '',
                    message: err?.message,
               },
          ];
     } else if (err instanceof Error) {
          message = err.message;
          errorSources = [
               {
                    path: '',
                    message: err?.message,
               },
          ];
     }

     //ultimate return
     res.status(statusCode).json({
          success: false,
          message,
          errorSources,
          err,
          stack: config.node_env === 'development' ? err?.stack : null,
     });
};



export default globalErrorHandler

