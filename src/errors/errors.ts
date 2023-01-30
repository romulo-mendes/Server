import * as Yup from 'yup';
import express, { Request, Response } from 'express';

export const errorHandler = express();

errorHandler.use((err: any, req: Request, resp: Response) => {
  if (err instanceof Yup.ValidationError) {
    return resp.status(400).json({ error: err.errors });
  } else if (
    err.message === 'Livro não encontrado!' ||
    err.message === 'O livro já esta emprestado' ||
    err.message === 'O livro não esta emprestado'
  ) {
    return resp.status(404).json({ error: err.message });
  } else {
    return resp.status(err.status || 500).json({ error: err.message });
  }
});
