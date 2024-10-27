import { DataSource, Repository } from 'typeorm';
import { Tenant } from '../../entity/Tenant';

export const truncateTables = async (connection: DataSource) => {
    const entities = connection.entityMetadatas;

    for (const entity of entities) {
        const repository = connection.getRepository(entity.name);
        await repository.clear();
    }
};

export const isJWT = (token: string | null): boolean => {
    if (!token) {
        return false;
    }

    const parts = token.split('.');
    if (parts.length != 3) {
        return false;
    }

    try {
        parts.forEach((part) => {
            Buffer.from(part, 'base64').toString('utf-8');
        });

        return true; // If above conversion is successful JWT structure is valid
    } catch (err) {
        return false; // If above conversion is not successful
    }
};

export const createTenant = async (repository: Repository<Tenant>) => {
    const tenant = await repository.save({
        name: 'Test Tenant',
        address: 'Test Tenant address',
    });

    return tenant;
};
