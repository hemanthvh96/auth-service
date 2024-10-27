import { LimitedUserData, UserData } from '../types';
import { User } from '../entity/User';
import { Repository } from 'typeorm';
import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';
import logger from '../config/logger';

export class UserService {
    constructor(private userRepository: Repository<User>) {}
    async create({
        firstName,
        lastName,
        email,
        password,
        role,
        tenantId,
    }: UserData) {
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
                role,
                tenant: tenantId ? { id: tenantId } : undefined, // In user repo, we can have tenants and normal users
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
            select: [
                'id',
                'firstName',
                'lastName',
                'email',
                'password',
                'role',
            ],
        });
    }

    async findById(id: number) {
        return await this.userRepository.findOne({
            where: { id: id },
        });
    }

    async update(
        userId: number,
        { firstName, lastName, role }: LimitedUserData,
    ) {
        try {
            return await this.userRepository.update(userId, {
                firstName,
                lastName,
                role,
            });
        } catch (err) {
            const error = createHttpError(
                500,
                'Failed to update the user in the database',
            );
            throw error;
        }
    }
    async getAll() {
        return await this.userRepository.find();
    }

    async deleteById(userId: number) {
        return await this.userRepository.delete(userId);
    }
}
