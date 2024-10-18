import { NextFunction, Response } from 'express';
import { RegisterUserRequest } from '../types';
import { UserService } from '../services/UserService';
import { Logger } from 'winston';
import { validationResult } from 'express-validator';
import { JwtPayload } from 'jsonwebtoken';
import { TokenService } from '../services/TokenService';

export class AuthController {
    constructor(
        private userService: UserService,
        private tokenService: TokenService,
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
}
