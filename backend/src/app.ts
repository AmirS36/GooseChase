import express from 'express';
import cors from "cors";
import authRouthes from './routes/auth';
import registerRoute from './routes/register';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouthes)
app.use('/api/register', registerRoute);

export default app;