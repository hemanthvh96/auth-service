import { Request } from 'express';

export interface UserData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: string;
    tenantId?: number;
}

export interface TenantData extends UserData {
    tenantID: number;
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

export interface ITenant {
    name: string;
    address: string;
}
export interface CreateTenantRequest extends Request {
    body: ITenant;
}

export interface CreateUserRequest extends Request {
    body: UserData;
}

export interface LimitedUserData {
    firstName: string;
    lastName: string;
    role: string;
}

export interface UpdateUserRequest extends Request {
    body: LimitedUserData;
}
