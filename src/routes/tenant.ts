/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';
import { TenantController } from '../controllers/TenantController';
import { AppDataSource } from '../config/data-source';
import { Tenant } from '../entity/Tenant';
import { TenantService } from '../services/TenantService';
import logger from '../config/logger';
import authenticate from '../middlewares/authenticate';
import { canAccess } from '../middlewares/canAccess';
import { Roles } from '../constants';

const router = express.Router();

const tenantRepository = AppDataSource.getRepository(Tenant);
const tenantService = new TenantService(tenantRepository);
const tenantController = new TenantController(tenantService, logger);

router.post('/', authenticate, canAccess([Roles.ADMIN]), (req, res, next) =>
    tenantController.create(req, res, next),
);

export default router;
