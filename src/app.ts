import 'reflect-metadata';
import express from 'express';
import { globalErrorHandler } from './middlewares/globalErrorHandler';
import authRouter from './routes/auth';

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.status(200).send('Welcome to Auth Service !!!!');
});

app.use('/auth', authRouter);

app.use(globalErrorHandler);

export default app;
