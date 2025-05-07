import express from 'express';
import cors from "cors";
import userRoutes from './routes/userRoutes';
import authRouthes from './routes/auth';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/users', userRoutes);
app.use('/api/auth', authRouthes)

export default app;