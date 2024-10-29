import { sign, JwtPayload } from 'jsonwebtoken';
import createHttpError from 'http-errors';
import { Config } from '../config';
import { Repository } from 'typeorm';
import { RefreshToken } from '../entity/RefreshToken';
import { User } from '../entity/User';

export class TokenService {
    constructor(private refreshTokenRepository: Repository<RefreshToken>) {}
    generateAccessToken(payload: JwtPayload) {
        // When you read from a file it should be Buffer
        // let privateKey: Buffer;
        let privateKey: string | undefined;

        if (!Config.PRIVATE_KEY) {
            const error = createHttpError(500, 'SECRET_KEY is not set');
            throw error;
        }

        try {
            // privateKey = fs.readFileSync(
            //     path.join(__dirname, '../../certs/private.pem'),
            // );

            // READING PRIVATE KEY FROM ENV VARIABLES SO WHILE BUILDING DOCKER IMAGES WE DON'T WANT OUR PRIVATE KEY TO BE PART OF IT.

            privateKey = Config.PRIVATE_KEY;
        } catch (err) {
            const error = createHttpError(
                500,
                'Unable to retrieve private key',
            );
            throw error;
        }

        const accessToken = sign(payload, privateKey, {
            algorithm: 'RS256',
            expiresIn: '1h',
            issuer: 'auth-service',
        });

        return accessToken;
    }

    generateRefreshToken(payload: JwtPayload, refreshTokenId: number) {
        const refreshToken = sign(payload, Config.REFRESH_TOKEN_SECRET!, {
            algorithm: 'HS256',
            expiresIn: '1y',
            issuer: 'auth-service',
            jwtid: String(refreshTokenId), // THIS IS NEEDED TO CHECK - If the refresh token id is tampered or not. We will retrieve this id and check if refresh token existed in db
        });

        return refreshToken;
    }

    async persistRefreshToken(user: User) {
        const newRefreshTokenDoc = await this.refreshTokenRepository.save({
            user: user,
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365), // Converted Date.now() + 1year (milliseconds) because typeorm entity accepts date check in entity
        });

        return newRefreshTokenDoc;
    }

    async deleteRefreshToken(tokenId: number) {
        return await this.refreshTokenRepository.delete({ id: tokenId });
    }
}
