import { Request, Response } from 'express';
import { User } from '../models/User';

export const getUser = (req: Request, res: Response) => {
  const user: User = {
    id: req.params.id,
    username: 'exampleUser',
    preferences: {
      hipHop: 0.7,
      rap: 0.6,
      bpm: 120,
      romantic: 0.4,
      sad: 0.2,
      happy: 0.5,
      chill: 0.8
    },
  };

  res.json(user);
};