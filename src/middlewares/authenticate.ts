import { expressjwt, GetVerificationKey } from 'express-jwt';
import jwksClient from 'jwks-rsa';
import { Config } from '../config';
import { Request } from 'express';
import { AuthCookie } from '../types';

export default expressjwt({
    secret: jwksClient.expressJwtSecret({
        jwksUri: Config.JWKS_URI!,
        jwksRequestsPerMinute: 5,
        rateLimit: true,
        cache: true,
    }) as GetVerificationKey,
    algorithms: ['RS256'],
    // issuer: 'auth-service',
    getToken: function (req: Request) {
        // RETRIEVING TOKEN FROM HEADER
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.split(' ')[1] !== undefined) {
            const token = authHeader.split(' ')[1];
            if (token) {
                return token;
            }
        }

        // RETRIEIVING TOKEN FROM COOKIE
        const { accessToken } = req.cookies as AuthCookie;
        return accessToken;
    },
});

// expressjwt is a middleware function
// If the token is invalid -> It sends 401 response
// If the token is valid -> It attaches the decoded token payload to the req.auth object
// NOTE: IN THE RECENT MIGRATION AT THIS TIME -> decoded token payload is attached to req.auth not req.user
