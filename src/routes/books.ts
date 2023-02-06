import express from "express";
import crypto from "crypto";
import { BookSchema, RentHistorySchema } from "../validation/validation";
import { Book, BookType, rentHistoryType } from "../models/books";
import fs from "fs";
import path from "path";

const booksPath = path.join(__dirname, "../data/books.json");
let books: Array<BookType> = [];

try {
  const data = fs.readFileSync(booksPath, "utf-8");
  const booksObj = JSON.parse(data);
  books = booksObj.books;
} catch (error) {
  if (error === "ENOENT") {
    console.error(`Arquivo ${booksPath} não encontrado.`);
    books = [];
  } else {
    console.error(`Erro ao ler o arquivo ${booksPath}:`, error);
  }
}
const bookModel = new Book(books);

export const booksRouter = express();

booksRouter.get("/", (_, resp) => {
  resp.json(books);
});

booksRouter.get("/rent", async (_, resp, next) => {
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

booksRouter.get("/:id", async (req, resp, next) => {
  try {
    const { id } = req.params;
    const book = bookModel.getById(id);
    if (!book) {
      throw new Error("Livro não encontrado!");
    }
    resp.json(book);
  } catch (error) {
    next(error);
  }
});

booksRouter.post("/", async (req, resp, next) => {
  try {
    await BookSchema.validate(req.body, { abortEarly: false });
    const book: BookType = req.body;
    book.id = crypto.randomUUID();
    books.push(book);
    fs.writeFileSync(booksPath, JSON.stringify({ books }), "utf-8");
    resp.status(201).json({ book, message: "Livro adicionado com sucesso!" });
  } catch (error) {
    next(error);
  }
});

booksRouter.put("/:id", async (req, resp, next) => {
  try {
    await BookSchema.validate(req.body, { abortEarly: false });
    const { id } = req.params;
    const bookIndex = bookModel.getId(id);
    if (bookIndex < 0) {
      throw new Error("Livro não encontrado!");
    }
    const book: BookType = req.body;
    books[bookIndex] = book;
    fs.writeFileSync(booksPath, JSON.stringify({ books }), "utf-8");
    resp.json({ book, message: "Livro editado com sucesso!" });
  } catch (error) {
    next(error);
  }
});

booksRouter.post("/:id/rent", async (req, resp, next) => {
  try {
    await RentHistorySchema.validate(req.body, { abortEarly: false });
    const { id } = req.params;
    const bookIndex = bookModel.getId(id);
    if (bookIndex < 0) throw new Error("Livro não encontrado!");
    if (books[bookIndex].rentHistory[books[bookIndex].rentHistory.length - 1].deliveryDate > new Date())
      throw new Error("O livro já esta emprestado");

    const rent: rentHistoryType = req.body;
    books[bookIndex].rentHistory.push(rent);
    fs.writeFileSync(booksPath, JSON.stringify({ books }), "utf-8");
    resp.status(201).json({ books, message: "Livro emprestado com sucesso!" });
  } catch (error) {
    next(error);
  }
});

booksRouter.put("/:id/rent", async (req, resp, next) => {
  try {
    await RentHistorySchema.validate(req.body, { abortEarly: false });
    const { id } = req.params;
    const bookIndex = bookModel.getId(id);
    if (bookIndex < 0) throw new Error("Livro não encontrado!");
    if (books[bookIndex].rentHistory.length > 0)
      if (books[bookIndex].rentHistory[books[bookIndex].rentHistory.length - 1].deliveryDate > new Date())
        throw new Error("O livro já esta emprestado");

    const rent: rentHistoryType = req.body;
    books[bookIndex].rentHistory[books[bookIndex].rentHistory.length - 1] = rent;
    const book = bookModel.getById(id);
    fs.writeFileSync(booksPath, JSON.stringify({ books }), "utf-8");
    resp.status(201).json({ book, message: "Livro emprestado com sucesso!" });
  } catch (error) {
    next(error);
  }
});

booksRouter.patch("/:id/rent", async (req, resp, next) => {
  try {
    const { id } = req.params;
    const bookIndex = bookModel.getId(id);
    if (bookIndex < 0) throw new Error("Livro não encontrado!");
    if (books[bookIndex].rentHistory[books[bookIndex].rentHistory.length - 1].deliveryDate < new Date())
      throw new Error("O livro não esta emprestado");

    books[bookIndex].rentHistory[books[bookIndex].rentHistory.length - 1].deliveryDate = new Date();
    const book = bookModel.getById(id);
    fs.writeFileSync(booksPath, JSON.stringify({ books }), "utf-8");
    resp.status(201).json({ book, message: "Livro devolvido com sucesso!" });
  } catch (error) {
    next(error);
  }
});

booksRouter.get("/:id/rent", async (req, resp, next) => {
  try {
    const { id } = req.params;
    const bookIndex = bookModel.getId(id);
    if (bookIndex < 0) throw new Error("Livro não encontrado!");
    const rentHistory = books[bookIndex].rentHistory;

    resp.status(201).json({ rentHistory });
  } catch (error) {
    next(error);
  }
});

booksRouter.patch("/:id/status", async (req, resp, next) => {
  try {
    const { id } = req.params;
    const bookIndex = bookModel.getId(id);
    if (bookIndex < 0) throw new Error("Livro não encontrado!");

    if (books[bookIndex].status.isActive) {
      books[bookIndex].status = req.body;
      const book = bookModel.getById(id);
      fs.writeFileSync(booksPath, JSON.stringify({ books }), "utf-8");
      resp.status(201).json({ book, message: "Livro inativado com sucesso!" });
    } else {
      books[bookIndex].status.description = "";
      books[bookIndex].status.isActive = true;
      fs.writeFileSync(booksPath, JSON.stringify({ books }), "utf-8");
    }
  } catch (error) {
    next(error);
  }
});
