/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */

/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { NextFunction, Request, Response } from 'express';


const notFound = (req: Request, res: Response, next: NextFunction) => {
     res.status(404).json({
          success: false,
          message: 'API Not Found !!',
          error: '',
     });
};

export default notFound;