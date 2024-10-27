import 'reflect-metadata';
import express from 'express';
import cookieParser from 'cookie-parser';
import { globalErrorHandler } from './middlewares/globalErrorHandler';
import authRouter from './routes/auth';
import tenantRouter from './routes/tenant';

const app = express();

app.use(cookieParser());
app.use(express.json());

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.status(200).send('Welcome to Auth Service !!!!');
});

app.use('/auth', authRouter);
app.use('/tenants', tenantRouter);

app.use(globalErrorHandler);

export default app;
