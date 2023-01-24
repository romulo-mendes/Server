import express, { NextFunction } from 'express';
import { Request, Response } from 'express';
import * as Yup from 'yup';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

import { BookType, rentHistoryType, UserType } from './models/books';
import { books, users } from './data';
import { BookSchema, RentHistorySchema, UserSchema } from './validation/validation';

const app = express();
app.use(express.json({ limit: '1mb' }));

const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.get('/books', (req: Request, resp: Response) => {
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
    next();
  }
});

app.get('/books/:id', (req: Request, resp: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const bookIndex = books.findIndex(p => p.id === id);
    if (bookIndex < 0) {
      return resp.status(404).json({ error: 'Livro não encontrado' });
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
    if (error instanceof Yup.ValidationError) {
      resp.status(400).json({ error: error.errors });
    } else {
      next(error);
    }
  }
});

app.put('/books/:id', async (req: Request, resp: Response, next: NextFunction) => {
  const { id } = req.params;
  const bookIndex = books.findIndex(p => p.id === id);
  if (bookIndex < 0) {
    return resp.status(404).json({ error: 'Livro não encontrado' });
  }
  try {
    await BookSchema.validate(req.body, { abortEarly: false });
    const book: BookType = req.body;
    books[bookIndex] = book;
    resp.json({ book, message: 'Livro editado com sucesso!' });
  } catch (error) {
    if (error instanceof Yup.ValidationError) {
      resp.status(400).json({ message: error.errors });
    } else {
      next(error);
    }
  }
});

app.post('/books/:id/rent', async (req: Request, resp: Response) => {
  const { id } = req.params;
  const bookIndex = books.findIndex(p => p.id === id);
  if (bookIndex < 0) return resp.status(404).json({ error: 'Livro não encontrado' });
  if (books[bookIndex].rentHistory[books[bookIndex].rentHistory.length - 1].deliveryDate > new Date())
    return resp.status(404).json({ error: 'O livro já esta emprestado' });
  try {
    await RentHistorySchema.validate(req.body, { abortEarly: false });
    const rent: rentHistoryType = req.body;
    books[bookIndex].rentHistory.push(rent);
    resp.status(201).json({ books, message: 'Livro emprestado com sucesso!' });
  } catch (err) {
    if (err instanceof Yup.ValidationError) {
      resp.status(400).json({ error: err.errors });
    } else {
      resp.status(500).json({ error: 'Erro no servidor' });
    }
  }
});

app.put('/books/:id/rent', async (req: Request, resp: Response) => {
  const { id } = req.params;
  const bookIndex = books.findIndex(p => p.id === id);
  if (bookIndex < 0) return resp.status(404).json({ error: 'Livro não encontrado' });
  if (books[bookIndex].rentHistory[books[bookIndex].rentHistory.length - 1].deliveryDate > new Date())
    return resp.status(404).json({ error: 'O livro já esta emprestado' });
  try {
    await RentHistorySchema.validate(req.body, { abortEarly: false });
    const rent: rentHistoryType = req.body;
    books[bookIndex].rentHistory[books[bookIndex].rentHistory.length - 1] = rent;
    const book = books[bookIndex];
    resp.status(201).json({ book, message: 'Livro emprestado com sucesso!' });
  } catch (err) {
    if (err instanceof Yup.ValidationError) {
      resp.status(400).json({ error: err.errors });
    } else {
      resp.status(500).json({ error: 'Erro no servidor' });
    }
  }
});

app.patch('/books/:id/rent', async (req: Request, resp: Response) => {
  const { id } = req.params;
  const bookIndex = books.findIndex(p => p.id === id);
  if (bookIndex < 0) return resp.status(404).json({ error: 'Livro não encontrado' });
  if (books[bookIndex].rentHistory[books[bookIndex].rentHistory.length - 1].deliveryDate < new Date())
    return resp.status(404).json({ error: 'O livro não esta emprestado' });
  try {
    books[bookIndex].rentHistory[books[bookIndex].rentHistory.length - 1].deliveryDate = new Date();
    const book = books[bookIndex];
    resp.status(201).json({ book, message: 'Livro devolvido com sucesso!' });
  } catch (err) {
    resp.status(500).json({ error: 'Erro no servidor' });
  }
});

app.get('/books/:id/rent', async (req: Request, resp: Response) => {
  const { id } = req.params;
  const bookIndex = books.findIndex(p => p.id === id);
  if (bookIndex < 0) return resp.status(404).json({ error: 'Livro não encontrado' });
  const rentHistory = books[bookIndex].rentHistory;
  try {
    resp.status(201).json({ rentHistory });
  } catch (err) {
    resp.status(500).json({ err });
  }
});

app.patch('/books/:id/status', async (req: Request, resp: Response) => {
  const { id } = req.params;
  const bookIndex = books.findIndex(p => p.id === id);
  if (bookIndex < 0) return resp.status(404).json({ error: 'Livro não encontrado' });
  try {
    if (books[bookIndex].status.isActive) {
      books[bookIndex].status = req.body;
      const book = books[bookIndex];
      resp.status(201).json({ book, message: 'Livro inativado com sucesso!' });
    } else {
      books[bookIndex].status.description = '';
      books[bookIndex].status.isActive = true;
    }
  } catch (err) {
    resp.status(500).json({ error: 'Erro no servidor' });
  }
});

app.post('/user', async (req: Request, resp: Response) => {
  try {
    await UserSchema.validate(req.body, { abortEarly: false });
    const user: UserType = req.body;
    const foundUser = users.find(
      currentUser => currentUser.email === user.email && currentUser.password === user.password
    );
    if (foundUser) {
      resp.status(200).send('Usuário e senha corretos!');
    } else {
      resp.status(401).send('Usuário ou senha incorretos!');
    }
  } catch (err) {
    if (err instanceof Yup.ValidationError) {
      resp.status(400).json({ error: err.errors });
    } else {
      resp.status(500).json({ error: 'Erro no servidor' });
    }
  }
});

app.use((error: Error, req: Request, resp: Response, next: NextFunction) => {
  resp.status(500).json({ error: error });
});

app.listen(3000, () => {
  console.log('Servidor iniciado na porta 3000');
});
