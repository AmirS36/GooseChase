import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";

const router = Router();

router.post('/', async (req: Request, res: Response) => {
    const { username, password } = req.body;

    if (!username || !password) {
        res.status(400).json({ message: "Missing username or password" });
        return
      }
  
      try {
        const existingUser = await prisma.user.findUnique({ where: { username } });
    
        if (existingUser) {
            res.status(409).json({ message: "Username already exists" });
            return;
        }
    
        const newUser = await prisma.user.create({
          data: {
            username,
            password, // Ideally hash this!
          },
        });
    
        res.status(201).json({ message: "User registered", userId: newUser.id });
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
      }
  });

export default router;