import { NextFunction, Response } from 'express';
import { RegisterUserRequest } from '../types';
import { UserService } from '../services/UserService';
import { Logger } from 'winston';
import { validationResult } from 'express-validator';

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
            this.logger.info('User has been registered', { id: user.id });
            res.status(201).json({ message: 'registration successful' });
        } catch (err) {
            next(err);
        }
    }
}
