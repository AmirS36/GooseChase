import express from 'express';
import cors from "cors";
import dotenv from 'dotenv';

import authRouthes from './routes/auth';
import registerRoute from './routes/register';
import recommendationsRoute from './routes/recommendations/recommend';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouthes)
app.use('/api/register', registerRoute);
app.use("/api/recommend", recommendationsRoute);


export default app;