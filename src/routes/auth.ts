/* eslint-disable @typescript-eslint/no-misused-promises */
import express, { Request, Response, NextFunction } from 'express';
import { AuthController } from '../controllers/AuthController';
import { UserService } from '../services/UserService';
import { AppDataSource } from '../config/data-source';
import { User } from '../entity/User';
import logger from '../config/logger';
import registerValidator from '../validators/register-validator';
import { RefreshToken } from '../entity/RefreshToken';
import { TokenService } from '../services/TokenService';
import loginValidator from '../validators/login-validator';
import { CredentialService } from '../services/CredentialService';
import authenticate from '../middlewares/authenticate';
import { AuthRequest } from '../types';
import validateRefreshToken from '../middlewares/validateRefreshToken';
import parseRefreshToken from '../middlewares/parseRefreshToken';

const router = express.Router();

const userRepository = AppDataSource.getRepository(User);
const tokenRepository = AppDataSource.getRepository(RefreshToken);
const userService = new UserService(userRepository);
const tokenService = new TokenService(tokenRepository);
const credentialService = new CredentialService();
const authController = new AuthController(
    userService,
    tokenService,
    credentialService,
    logger,
);

router.post(
    '/register',
    registerValidator,
    (req: Request, res: Response, next: NextFunction) =>
        authController.register(req, res, next),
);

router.post(
    '/login',
    loginValidator,
    (req: Request, res: Response, next: NextFunction) =>
        authController.login(req, res, next),
);

router.get(
    '/self',
    authenticate,
    (req: Request, res: Response, next: NextFunction) =>
        authController.self(req as AuthRequest, res, next),
);

router.post(
    '/refresh',
    validateRefreshToken,
    (req: Request, res: Response, next: NextFunction) =>
        authController.refreshToken(req as AuthRequest, res, next),
);

router.post(
    '/logout',
    authenticate,
    parseRefreshToken,
    (req: Request, res: Response, next: NextFunction) =>
        authController.logout(req as AuthRequest, res, next),
);

export default router;

/* 
validateRefreshToken and parseRefreshToken has the similar functionlaity except the isRevoked() method which is
there on the validateRefreshToken middleware which is not required in parseRefreshToken as the name suggest that
we are parsing the refresh token from the cookie.

we use parseRefreshToken only in the logout here as we are deleting the refresh token from db

*/
