import { Request } from 'express';

export interface UserData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export interface RegisterUserRequest extends Request {
    body: UserData;
}

export interface AuthRequest extends Request {
    auth: {
        sub: string;
        role: string;
        jti: string;
    };
}

export interface ErrorResponse {
    error: {
        ref: string;
        type: string;
        msg: string;
        method: string;
        path: string;
        stack: string;
    }[];
}

export type AuthCookie = {
    refreshToken: string;
    accessToken: string;
};
