import { UserData } from '../types';
import { User } from '../entity/User';
import { Repository } from 'typeorm';
import createHttpError from 'http-errors';
import { Roles } from '../constants';
import bcrypt from 'bcrypt';
import logger from '../config/logger';

export class UserService {
    constructor(private userRepository: Repository<User>) {}
    async create({ firstName, lastName, email, password }: UserData) {
        const user = await this.userRepository.findOne({
            where: { email: email },
        });

        logger.info(user);

        if (user) {
            const err = createHttpError(400, 'Email already exists!');
            throw err;
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        try {
            return await this.userRepository.save({
                firstName,
                lastName,
                email,
                password: hashedPassword,
                role: Roles.CUSTOMER,
            });
        } catch (err) {
            const error = createHttpError(
                500,
                'Failed to store the data in database',
            );
            throw error; // This is catched in the controller and send to the global error handler by calling next(error)
        }
    }

    async findByEmail(email: string) {
        return await this.userRepository.findOne({
            where: { email: email },
        });
    }
}
