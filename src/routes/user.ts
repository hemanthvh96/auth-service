/* eslint-disable @typescript-eslint/no-misused-promises */
import express, { NextFunction, Request, Response } from 'express';
import authenticate from '../middlewares/authenticate';
import { canAccess } from '../middlewares/canAccess';
import { Roles } from '../constants';
import { UserController } from '../controllers/UserController';
import { UserService } from '../services/UserService';
import { User } from '../entity/User';
import { AppDataSource } from '../config/data-source';
import registerValidator from '../validators/register-validator';
import logger from '../config/logger';

const router = express.Router();

const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const userController = new UserController(userService, logger);

router.post(
    '/',
    authenticate,
    canAccess([Roles.ADMIN]),
    registerValidator,
    (req: Request, res: Response, next: NextFunction) =>
        userController.create(req, res, next),
);

export default router;
