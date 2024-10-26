import { NextFunction, Response } from 'express';
import { AuthRequest, RegisterUserRequest } from '../types';
import { UserService } from '../services/UserService';
import { Logger } from 'winston';
import { validationResult } from 'express-validator';
import { JwtPayload } from 'jsonwebtoken';
import { TokenService } from '../services/TokenService';
import createHttpError from 'http-errors';
import { CredentialService } from '../services/CredentialService';

export class AuthController {
    constructor(
        private userService: UserService,
        private tokenService: TokenService,
        private credentialService: CredentialService,
        private logger: Logger,
    ) {}
    async register(
        req: RegisterUserRequest,
        res: Response,
        next: NextFunction,
    ) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            // HERE I DONT NEED TO THROW ERROR
            // BECAUSE EXRPRESS VALDIATOR ALREADY HANDLES THE ERROR DETAILS WELL
            // THEREFORE, NOT REQUIRED TO PASS IT THROUGH OUR GLOBAL ERROR HANDLER
            return res.status(400).json({ errors: result.array() });
        }
        try {
            const { firstName, lastName, email, password } = req.body;

            this.logger.debug('New request to register a user', {
                firstName,
                lastName,
                email,
            });
            const user = await this.userService.create({
                firstName,
                lastName,
                email,
                password,
            });

            const payload: JwtPayload = {
                sub: String(user.id), // sub accepts string but user.id is Number. Typecast
                role: user.role,
            };

            const accessToken = this.tokenService.generateAccessToken(payload);

            res.cookie('accessToken', accessToken, {
                domain: 'localhost',
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60,
                secure: false, // IN PROD SET TO TRUE
                httpOnly: true,
            });

            // PERSISTING REFRESH TOKEN TO DB:

            const newRefreshTokenDoc =
                await this.tokenService.persistRefreshToken(user);

            const refreshToken = this.tokenService.generateRefreshToken(
                payload,
                newRefreshTokenDoc.id,
            );

            // Should change for refresh token
            res.cookie('refreshToken', refreshToken, {
                domain: 'localhost',
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60 * 24 * 365, // 1YEAR
                secure: false, // IN PROD SET TO TRUE
                httpOnly: true,
            });

            this.logger.info('User has been registered', { id: user.id });
            res.status(201).json({
                message: 'registration successful',
                id: user.id,
            });
        } catch (err) {
            next(err);
        }
    }

    async login(req: RegisterUserRequest, res: Response, next: NextFunction) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }
        try {
            const { email, password } = req.body;

            this.logger.debug('New request to login a user', {
                email,
                password: '*****',
            });

            // CHECK IF USER EXISTS
            const user = await this.userService.findByEmail(email);

            if (!user) {
                const error = createHttpError(
                    400,
                    "Email or Password doesn't match",
                );

                throw error;
            }

            // CHECK FOR VALID PASSWORD

            const isValidPassword =
                await this.credentialService.comparePassword(
                    password,
                    user.password,
                );

            if (!isValidPassword) {
                const error = createHttpError(
                    400,
                    "Email or Password doesn't match",
                );

                throw error;
            }

            const payload: JwtPayload = {
                sub: String(user.id), // sub accepts string but user.id is Number. Typecast
                role: user.role,
            };

            const accessToken = this.tokenService.generateAccessToken(payload);

            this.logger.info('New access token generated for the user', {
                id: user.id,
            });

            res.cookie('accessToken', accessToken, {
                domain: 'localhost',
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60,
                secure: false, // IN PROD SET TO TRUE
                httpOnly: true,
            });

            // PERSISTING REFRESH TOKEN TO DB:

            const newRefreshTokenDoc =
                await this.tokenService.persistRefreshToken(user);

            this.logger.info('New refresh token generated for the user', {
                id: user.id,
            });

            const refreshToken = this.tokenService.generateRefreshToken(
                payload,
                newRefreshTokenDoc.id,
            );

            // Should change for refresh token
            res.cookie('refreshToken', refreshToken, {
                domain: 'localhost',
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60 * 24 * 365, // 1YEAR
                secure: false, // IN PROD SET TO TRUE
                httpOnly: true,
            });

            this.logger.info('User has been logged in successfully', {
                id: user.id,
            });
            res.status(200).json({
                message: 'login successful',
                id: user.id,
            });
        } catch (err) {
            next(err);
        }
    }

    async self(req: AuthRequest, res: Response, next: NextFunction) {
        const { auth } = req;
        const user = await this.userService.findById(Number(auth.sub));
        if (!user) {
            const error = createHttpError(404, 'User not found');
            return next(error);
        }

        res.status(200).json({ ...user, password: undefined });
    }

    async refreshToken(req: AuthRequest, res: Response, next: NextFunction) {
        const payload: JwtPayload = {
            sub: req.auth.sub,
            role: req.auth.role,
        };

        const user = await this.userService.findById(Number(payload.sub));

        if (!user) {
            const error = createHttpError(
                400,
                'User with the token could not find in DB',
            );
            return next(error);
        }

        const accessToken = this.tokenService.generateAccessToken(payload);

        this.logger.info('New access token generated for the user', {
            id: user.id,
        });

        res.cookie('accessToken', accessToken, {
            domain: 'localhost',
            sameSite: 'strict',
            maxAge: 1000 * 60 * 60,
            secure: false, // IN PROD SET TO TRUE
            httpOnly: true,
        });

        // PERSISTING REFRESH TOKEN TO DB:

        const newRefreshTokenDoc =
            await this.tokenService.persistRefreshToken(user);

        // DELETE OLD REFRESH TOKEN IN DB:

        await this.tokenService.deleteRefreshToken(Number(req.auth.jti));

        const refreshToken = this.tokenService.generateRefreshToken(
            payload,
            newRefreshTokenDoc.id,
        );

        this.logger.info('New refresh token generated for the user', {
            id: user.id,
            tokenId: newRefreshTokenDoc.id,
        });

        // Should change for refresh token
        res.cookie('refreshToken', refreshToken, {
            domain: 'localhost',
            sameSite: 'strict',
            maxAge: 1000 * 60 * 60 * 24 * 365, // 1YEAR
            secure: false, // IN PROD SET TO TRUE
            httpOnly: true,
        });

        res.status(201).json({
            id: user.id,
        });
    }

    async logout(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            await this.tokenService.deleteRefreshToken(Number(req.auth.jti));
            this.logger.info('Refresh token has been deleted', {
                id: req.auth.jti,
            });
            this.logger.info('User has been logged out', { id: req.auth.sub });

            res.clearCookie('accessToken');
            res.clearCookie('refreshToken');

            res.json({});
        } catch (err) {
            return next(err);
        }
    }
}
