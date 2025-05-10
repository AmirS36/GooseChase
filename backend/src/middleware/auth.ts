import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key';

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(" ")[1]; // Extract token from "Bearer <token>"

  if (!token) {
    res.status(401).json({ error: "Access token is missing" });
    return;
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY); // Use SECRET_KEY directly here
    (req as any).user = decoded; // Attach decoded user info to the request
    next(); 
  } catch (err) {
    res.status(403).json({ error: "Invalid or expired token" });
    return;
  }
}