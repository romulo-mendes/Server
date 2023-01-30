import express from 'express';
import crypto from 'crypto';
import { books } from '../data';
import { BookSchema, RentHistorySchema } from '../validation/validation';
import { BookType, rentHistoryType } from '../models/books';

export const booksRouter = express();

booksRouter.use(express.json({ limit: '1mb' }));

booksRouter.get('/', (_, resp) => {
  resp.json(books);
});

booksRouter.get('/rent', async (_, resp, next) => {
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

booksRouter.get('/:id', (req, resp, next) => {
  try {
    const { id } = req.params;
    const book = books.find(book => book.id === id);
    if (!book) {
      throw new Error('Livro não encontrado!');
    }
    resp.json(book);
  } catch (error) {
    next(error);
  }
});

booksRouter.post('', async (req, resp, next) => {
  try {
    await BookSchema.validate(req.body, { abortEarly: false });
    const book: BookType = req.body;
    book.id = crypto.randomBytes(64).toString('hex');
    books.push(book);
    resp.status(201).json({ books, message: 'Livro adicionado com sucesso!' });
  } catch (error) {
    next(error);
  }
});

booksRouter.put('/:id', async (req, resp, next) => {
  try {
    await BookSchema.validate(req.body, { abortEarly: false });
    const { id } = req.params;
    const bookIndex = books.findIndex(p => p.id === id);
    if (bookIndex < 0) {
      throw new Error('Livro não encontrado!');
    }
    const book: BookType = req.body;
    books[bookIndex] = book;
    resp.json({ book, message: 'Livro editado com sucesso!' });
  } catch (error) {
    next(error);
  }
});

booksRouter.post('/:id/rent', async (req, resp, next) => {
  try {
    await RentHistorySchema.validate(req.body, { abortEarly: false });
    const { id } = req.params;
    const bookIndex = books.findIndex(p => p.id === id);
    if (bookIndex < 0) throw new Error('Livro não encontrado!');
    if (books[bookIndex].rentHistory[books[bookIndex].rentHistory.length - 1].deliveryDate > new Date())
      throw new Error('O livro já esta emprestado');

    const rent: rentHistoryType = req.body;
    books[bookIndex].rentHistory.push(rent);
    resp.status(201).json({ books, message: 'Livro emprestado com sucesso!' });
  } catch (error) {
    next(error);
  }
});

booksRouter.put('/:id/rent', async (req, resp, next) => {
  try {
    await RentHistorySchema.validate(req.body, { abortEarly: false });
    const { id } = req.params;
    const bookIndex = books.findIndex(p => p.id === id);
    if (bookIndex < 0) throw new Error('Livro não encontrado!');
    if (books[bookIndex].rentHistory[books[bookIndex].rentHistory.length - 1].deliveryDate > new Date())
      throw new Error('O livro já esta emprestado');

    const rent: rentHistoryType = req.body;
    books[bookIndex].rentHistory[books[bookIndex].rentHistory.length - 1] = rent;
    const book = books[bookIndex];
    resp.status(201).json({ book, message: 'Livro emprestado com sucesso!' });
  } catch (error) {
    next(error);
  }
});

booksRouter.patch('/:id/rent', async (req, resp, next) => {
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

booksRouter.get('/:id/rent', async (req, resp, next) => {
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

booksRouter.patch('/:id/status', async (req, resp, next) => {
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
