import { expressjwt } from 'express-jwt';
import { Config } from '../config';
import { Request } from 'express';
import { AuthCookie } from '../types';
import { AppDataSource } from '../config/data-source';
import { RefreshToken } from '../entity/RefreshToken';
import { Jwt, JwtPayload } from 'jsonwebtoken';
import logger from '../config/logger';

export default expressjwt({
    secret: Config.REFRESH_TOKEN_SECRET!,
    algorithms: ['HS256'],
    getToken(req: Request) {
        const { refreshToken } = req.cookies as AuthCookie;
        return refreshToken;
    },

    async isRevoked(req: Request, decodedToken: Jwt | undefined) {
        const payload = decodedToken?.payload as JwtPayload;
        try {
            const refreshTokenRepo = AppDataSource.getRepository(RefreshToken);
            const refreshTokenRecord = await refreshTokenRepo.findOne({
                where: {
                    id: Number(payload.jti),
                    user: { id: Number(payload.sub) },
                },
            });
            return !refreshTokenRecord; // If record exists we return false => isRevoked is false and if record doesn't exists we return true => isRevoked is true
        } catch (err) {
            logger.error('Error while retrieving the refresh token', {
                id: payload.jti, // we are logging refresh tokem id to identify which token caused the issue
            });
            return true; // by default we say isRevoked to be true in catch block
        }
    },
});

// Once access token is received from the cookies. expressJWT performs the JWT validation/verfication and extracts
// the payload from that token and pass it as the second argument to the isRevoked() custom method.
// Below is how decoded JWT payload looks like

// {
//     header: { alg: 'HS256', typ: 'JWT' },
//     payload: {
//       sub: '2',   ---------------> userId
//       role: 'customer',
//       iat: 1729901998,
//       exp: 1761459598,
//       iss: 'auth-service',
//       jti: '13'  ----------------> RefreshTokenID (in DB for RefreshToken table it is named as id)
//     },
//     signature: 'YzRK41QGp8IDJmNr8flSG3nBxy6dqOh0FELZth-Mq7U'
//   }
