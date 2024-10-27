import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import createHttpError from 'http-errors';

export const canAccess = (roles: string[] = []) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const _req = req as AuthRequest; // YOU CANNOT CHANGE THE REQ IN ABOVE LINE TO BE AUTHREQUEST
        const roleFromToken = _req.auth.role;

        if (!roles.includes(roleFromToken)) {
            const error = createHttpError(
                403,
                'You do not have access to perform this operation',
            );
            return next(error);
        }

        next();
    };
};
