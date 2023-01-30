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
