import express from 'express';
import cors from 'cors';
import { authenticateToken } from './middlewares/auth';
import { userRouter } from './routes/user';
import { booksRouter } from './routes/books';
import { errorHandler } from './errors/errors';

const app = express();
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));

app.use('/user', userRouter);

app.use(authenticateToken);

app.use('/books', booksRouter);

app.use(errorHandler);

app.listen(3000, () => {
  console.log('Servidor iniciado na porta 3000');
});
