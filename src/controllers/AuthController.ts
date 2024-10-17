import { NextFunction, Response } from 'express';
import { RegisterUserRequest } from '../types';
import { UserService } from '../services/UserService';
import { Logger } from 'winston';
import { validationResult } from 'express-validator';
import { JwtPayload, sign } from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import createHttpError from 'http-errors';
import { Config } from '../config/index';

export class AuthController {
    constructor(
        private userService: UserService,
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

            let privateKey: Buffer; // When you read from a file it should be Buffer
            try {
                privateKey = fs.readFileSync(
                    path.join(__dirname, '../../certs/private.pem'),
                );
            } catch (err) {
                const error = createHttpError(500, 'Error reading private key');
                return next(error);
            }

            const payload: JwtPayload = {
                sub: String(user.id), // sub accepts string but user.id is Number. Typecast
                role: user.role,
            };

            const accessToken = sign(payload, privateKey, {
                algorithm: 'RS256',
                expiresIn: '1h',
                issuer: 'auth-service',
            });
            const refreshToken = sign(payload, Config.REFRESH_TOKEN_SECRET!, {
                algorithm: 'HS256',
                expiresIn: '1y',
                issuer: 'auth-service',
            });

            res.cookie('accessToken', accessToken, {
                domain: 'localhost',
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60,
                secure: false, // IN PROD SET TO TRUE
                httpOnly: true,
            });

            // Should change for refresh token
            res.cookie('refreshToken', refreshToken, {
                domain: 'localhost',
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60 * 24 * 365, // 1YEAR
                secure: false, // IN PROD SET TO TRUE
                httpOnly: true,
            });

            this.logger.info('User has been registered', { id: user.id });
            res.status(201).json({ message: 'registration successful' });
        } catch (err) {
            next(err);
        }
    }
}
