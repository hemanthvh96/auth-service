import bcrypt from 'bcrypt';

export class CredentialService {
    constructor() {}

    async comparePassword(userPassword: string, passwordHash: string) {
        return await bcrypt.compare(userPassword, passwordHash);
    }
}
