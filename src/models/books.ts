export type StatusType = {
  isActive: boolean;
  description: string;
};

export type rentHistoryType = {
  studentName: string;
  class: string;
  withdrawalDate: Date;
  deliveryDate: Date;
};

export type BookType = {
  id: string;
  tittle: string;
  author: string;
  genre: string;
  status: StatusType;
  image: string;
  systemEntryDate: Date;
  synopsis: string;
  rentHistory: rentHistoryType[];
};

export type allRentType = {
  studentName: string;
  class: string;
  tittle: string;
  withdrawalDate: Date;
  deliveryDate: Date;
};

interface IBook {
  books: BookType[];
  getById(id: string): BookType | undefined;
  getId(id: string): number;
}

export class Book implements IBook {
  public constructor(public books: BookType[]) {}

  public getById(id: string): BookType | undefined {
    return this.books.find(book => book.id === id);
  }

  public getId(id: string): number {
    return this.books.findIndex(book => book.id === id);
  }
}
