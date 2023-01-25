import express, { NextFunction, Request, Response } from 'express';
import * as Yup from 'yup';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import crypto from 'crypto';
import fs from 'fs';

import { BookType, rentHistoryType, UserType } from './models/books';
import { books, users } from './data';
import { BookSchema, RentHistorySchema, UserSchema } from './validation/validation';

const app = express();
app.use(express.json({ limit: '1mb' }));

const secret = crypto.randomBytes(64).toString('hex');
fs.writeFileSync('.env', `TOKEN_SECRET=${secret}\n`, { flag: 'a' });
dotenv.config();

function generateAccessToken(email: string) {
  const payload = { email: email };
  const secret = process.env.TOKEN_SECRET as string;
  const options = { expiresIn: '1800s' };

  return jwt.sign(payload, secret, options);
}

const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

function authenticateToken(req: Request, resp: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return resp.sendStatus(401);
  jwt.verify(token, process.env.TOKEN_SECRET as string, (err: any) => {
    console.log(err);
    if (err) return resp.sendStatus(403);
    next();
  });
}

app.get('/books', authenticateToken, (req: Request, resp: Response) => {
  resp.json(books);
});

app.get('/books/rent', async (req: Request, resp: Response, next: NextFunction) => {
  try {
    const rentHistory = books.flatMap(book =>
      book.rentHistory.map(history => ({
        studentName: history.studentName,
        class: history.class,
        tittle: book.tittle,
        withdrawalDate: history.withdrawalDate,
        deliveryDate: history.deliveryDate,
      }))
    );
    resp.json({ rentHistory });
  } catch (error) {
    next(error);
  }
});

app.get('/books/:id', (req: Request, resp: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const bookIndex = books.findIndex(p => p.id === id);
    if (bookIndex < 0) {
      throw new Error('Livro não encontrado!');
    }
    resp.json(books[bookIndex]);
  } catch (error) {
    next(error);
  }
});

app.post('/book', async (req: Request, resp: Response, next: NextFunction) => {
  try {
    await BookSchema.validate(req.body, { abortEarly: false });
    const book: BookType = req.body;
    if (!book.id) book.id = uuidv4();
    books.push(book);
    resp.status(201).json({ books, message: 'Livro adicionado com sucesso!' });
  } catch (error) {
    next(error);
  }
});

app.put('/books/:id', async (req: Request, resp: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const bookIndex = books.findIndex(p => p.id === id);
    if (bookIndex < 0) {
      throw new Error('Livro não encontrado!');
    }
    await BookSchema.validate(req.body, { abortEarly: false });
    const book: BookType = req.body;
    books[bookIndex] = book;
    resp.json({ book, message: 'Livro editado com sucesso!' });
  } catch (error) {
    next(error);
  }
});

app.post('/books/:id/rent', async (req: Request, resp: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const bookIndex = books.findIndex(p => p.id === id);
    if (bookIndex < 0) throw new Error('Livro não encontrado!');
    if (books[bookIndex].rentHistory[books[bookIndex].rentHistory.length - 1].deliveryDate > new Date())
      throw new Error('O livro já esta emprestado');

    await RentHistorySchema.validate(req.body, { abortEarly: false });
    const rent: rentHistoryType = req.body;
    books[bookIndex].rentHistory.push(rent);
    resp.status(201).json({ books, message: 'Livro emprestado com sucesso!' });
  } catch (error) {
    next(error);
  }
});

app.put('/books/:id/rent', async (req: Request, resp: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const bookIndex = books.findIndex(p => p.id === id);
    if (bookIndex < 0) throw new Error('Livro não encontrado!');
    if (books[bookIndex].rentHistory[books[bookIndex].rentHistory.length - 1].deliveryDate > new Date())
      throw new Error('O livro já esta emprestado');

    await RentHistorySchema.validate(req.body, { abortEarly: false });
    const rent: rentHistoryType = req.body;
    books[bookIndex].rentHistory[books[bookIndex].rentHistory.length - 1] = rent;
    const book = books[bookIndex];
    resp.status(201).json({ book, message: 'Livro emprestado com sucesso!' });
  } catch (error) {
    next(error);
  }
});

app.patch('/books/:id/rent', async (req: Request, resp: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const bookIndex = books.findIndex(p => p.id === id);
    if (bookIndex < 0) throw new Error('Livro não encontrado!');
    if (books[bookIndex].rentHistory[books[bookIndex].rentHistory.length - 1].deliveryDate < new Date())
      throw new Error('O livro não esta emprestado');

    books[bookIndex].rentHistory[books[bookIndex].rentHistory.length - 1].deliveryDate = new Date();
    const book = books[bookIndex];
    resp.status(201).json({ book, message: 'Livro devolvido com sucesso!' });
  } catch (error) {
    next(error);
  }
});

app.get('/books/:id/rent', async (req: Request, resp: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const bookIndex = books.findIndex(p => p.id === id);
    if (bookIndex < 0) throw new Error('Livro não encontrado!');
    const rentHistory = books[bookIndex].rentHistory;

    resp.status(201).json({ rentHistory });
  } catch (error) {
    next(error);
  }
});

app.patch('/books/:id/status', async (req: Request, resp: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const bookIndex = books.findIndex(p => p.id === id);
    if (bookIndex < 0) throw new Error('Livro não encontrado!');

    if (books[bookIndex].status.isActive) {
      books[bookIndex].status = req.body;
      const book = books[bookIndex];
      resp.status(201).json({ book, message: 'Livro inativado com sucesso!' });
    } else {
      books[bookIndex].status.description = '';
      books[bookIndex].status.isActive = true;
    }
  } catch (error) {
    next(error);
  }
});

app.post('/user', async (req: Request, resp: Response, next: NextFunction) => {
  try {
    await UserSchema.validate(req.body, { abortEarly: false });
    const user: UserType = req.body;
    const foundUser = users.find(
      currentUser => currentUser.email === user.email && currentUser.password === user.password
    );
    if (foundUser) {
      const token = generateAccessToken(user.email);
      resp.status(200).json(token);
    } else {
      resp.status(401).send('Usuário ou senha incorretos!');
    }
  } catch (error) {
    next(error);
  }
});

app.post('/validate-token', authenticateToken, (req: Request, resp: Response) => {
  resp.status(200).json({ message: 'Token is valid' });
});

app.use((err: any, req: Request, resp: Response, next: NextFunction) => {
  if (err instanceof Yup.ValidationError) {
    resp.status(400).json({ error: err.errors });
  } else if (
    err.message === 'Livro não encontrado!' ||
    err.message === 'O livro já esta emprestado' ||
    err.message === 'O livro não esta emprestado'
  ) {
    resp.status(404).json({ error: err.message });
  } else {
    resp.status(err.status || 500).json({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log('Servidor iniciado na porta 3000');
});
