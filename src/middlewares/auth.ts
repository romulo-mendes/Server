import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

export function authenticateToken(req: Request, resp: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return resp.status(401).json({ message: 'Token não encontrado' });
  jwt.verify(token, process.env.TOKEN_SECRET as string, error => {
    if (error) return resp.status(403).json({ message: 'Token inválido' });
    next();
  });
}
