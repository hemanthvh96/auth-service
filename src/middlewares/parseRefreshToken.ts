import { expressjwt } from 'express-jwt';
import { Config } from '../config';
import { Request } from 'express';
import { AuthCookie } from '../types';

export default expressjwt({
    secret: Config.REFRESH_TOKEN_SECRET!,
    algorithms: ['HS256'],
    getToken(req: Request) {
        const { refreshToken } = req.cookies as AuthCookie;
        return refreshToken;
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
