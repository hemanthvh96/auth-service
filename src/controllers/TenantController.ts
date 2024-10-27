import { NextFunction, Response } from 'express';
import { TenantService } from '../services/TenantService';
import { TenantRequest } from '../types';
import { Logger } from 'winston';

export class TenantController {
    constructor(
        private tenantService: TenantService,
        private logger: Logger,
    ) {}
    async create(req: TenantRequest, res: Response, next: NextFunction) {
        const { name, address } = req.body;
        this.logger.debug('Request for creating a tenant', { name, address });
        try {
            const tenant = await this.tenantService.create({ name, address });
            res.status(201).json({
                id: tenant.id,
                message: 'Tenant created successfully',
            });
        } catch (err) {
            next(err);
        }
    }
}
