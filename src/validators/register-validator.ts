import { checkSchema } from 'express-validator';

export default checkSchema({
    firstName: {
        errorMessage: 'First name is required',
        notEmpty: true,
        trim: true,
    },
    lastName: {
        errorMessage: 'Last name is required',
        notEmpty: true,
        trim: true,
    },
    email: {
        errorMessage: 'Email is required',
        notEmpty: true,
        trim: true,
        isEmail: {
            errorMessage: 'Email should be a valid email',
        },
    },
    password: {
        errorMessage: 'password is required',
        notEmpty: true,
        trim: true,
    },
});
