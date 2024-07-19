import { NextFunction, Request, Response } from 'express';
import { HttpError } from 'http-errors';
import { v4 as uuidv4 } from 'uuid';
import logger from '../config/logger';
import { Config } from '../config';

export const globalErrorHandler = (
    err: HttpError,
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next: NextFunction,
) => {
    const errorID = uuidv4();
    const statusCode = err.statusCode || 500;
    const isProduction = Config.NODE_ENV === 'production';

    let message = 'Internal Server Error';

    // TODO: Message can be made much more better

    if (err.statusCode === 400) {
        message = err.message;
    }

    logger.error(err.message, {
        id: errorID,
        statusCode,
        error: err.stack,
        path: req.path,
        method: req.method,
    });

    res.status(statusCode).json({
        error: [
            {
                ref: errorID,
                type: err.name,
                msg: message,
                path: req.path,
                method: req.method,
                stack: isProduction ? null : err.stack,
            },
        ],
    });
};

/* 
Points to consider:

1. For most errors (status code != 400), the client receives a generic "Internal server error" message instead of the actual error message. This is a security measure to avoid exposing potentially sensitive information about the system's internals.
2. For Status Codes === 400 (Bad Request) error message is not changed as these are client errors
3. For all the environments: logger captures error stack trace
   But for sending response to the client:
   For Non-Prod environments : Send stack trace in response
   For Prod environments: DON'T send error stack trace in response


*/
