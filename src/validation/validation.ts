import * as Yup from 'yup';

export const UserSchema = Yup.object().shape({
  email: Yup.string().email().required(),
  password: Yup.string().required(),
});

const StatusSchema = Yup.object().shape({
  isActive: Yup.boolean().required(),
  description: Yup.string().when('isActive', {
    is: false,
    then: Yup.string().required(),
    otherwise: Yup.string().nullable(),
  }),
});

export const RentHistorySchema = Yup.object().shape({
  studentName: Yup.string().required(),
  class: Yup.string().required(),
  withdrawalDate: Yup.string().required(),
  deliveryDate: Yup.string().required(),
});

export const BookSchema = Yup.object().shape({
  id: Yup.string(),
  tittle: Yup.string().required(),
  author: Yup.string().required(),
  genre: Yup.string().required(),
  status: StatusSchema.required(),
  image: Yup.string().required(),
  systemEntryDate: Yup.string().required(),
  synopsis: Yup.string().required(),
  rentHistory: Yup.array().of(RentHistorySchema).required(),
});
