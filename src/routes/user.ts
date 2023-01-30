import jwt from 'jsonwebtoken';
import express from 'express';
import { users } from '../data';
import { UserType } from '../models/users';
import { UserSchema } from '../validation/validation';
import dotenv from 'dotenv';
import { authenticateToken } from '../middlewares/auth';

dotenv.config();

export const userRouter = express();

userRouter.post('/', async (req, resp, next) => {
  try {
    await UserSchema.validate(req.body, { abortEarly: false });
    const user: UserType = req.body;
    const foundUser = users.find(
      currentUser => currentUser.email === user.email && currentUser.password === user.password
    );
    if (foundUser) {
      const token = jwt.sign({ email: user.email }, process.env.TOKEN_SECRET as string, { expiresIn: '1d' });
      resp.status(200).json(token);
    } else {
      resp.status(401).send('Usuário ou senha incorretos!');
    }
  } catch (error) {
    next(error);
  }
});

userRouter.get('/validate-token', authenticateToken, (req, resp) => {
  resp.status(200).json({ message: 'Token is valid' });
});
