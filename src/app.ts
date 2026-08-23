import express from 'express';
import { errorHandler } from './utils/errorHandler.js';
import authRouter from './modules/auth/auth.routes.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/v1/auth', authRouter);
app.use(errorHandler);

export default app;
