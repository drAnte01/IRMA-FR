export interface ICategory {
  id?: number;
  name?: string;
  type?: "food" | "drink";
}

export type IItem = {
  id?: number;
  name?: string;
  categoryId?: number;
  categoryName?: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  select?: any[];
};

export type IStaff = {
  id?: number;
  Fname?: string;
  Lname?: string;
  email?: string;
  username?: string;
  password?: string;
  typeStaff?: string;
  dateOfBirth?: string;
  image?: string;
  phone?: string;
  adress?: string;
};

export type IOrderInfo = {
  id?: number;
  table?: string;
  status?: string;
  totalPrice?: string;
  subtotal?: string;
  taxRate?: string;
  taxAmount?: string;
  createdAt?: string;
};

export type IOrderItem = {
  id?: number;
  itemId?: number;
  itemName?: string;
  quantity?: string | number;
  price?: string | number;
  CreatedAt?: string;
};

export type IOrder = {
  order?: IOrderInfo;
  orderItems?: IOrderItem[];
};

//mozda i ne treba
export type IMessage = {
  title: string;
  content: string;
};

export type IInput = {
  name?: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  categoryId?: string | number;
  Fname?: string;
  Lname?: string;
  email?: string;
  username?: string;
  password?: string;
  typeStaff?: string;
  dateOfBirth?: string;
  image?: string;
  adress?: string;
  phone?: string;
};

export interface ILabels {
  name?: string;
  type?: string;
  description?: string;
  price?: string;
  imageUrl?: string;
  Fname?: string;
  Lname?: string;
  email?: string;
  username?: string;
  password?: string;
  typeStaff?: string;
  dateOfBirth?: string;
  image?: string;
  adress?: string;
  phone?: string;
}

export type IPopUp = {
  title?: string;
  type?: "food" | "drink";
  labels?: {
    name?: string;
    type?: string;
    description?: string;
    price?: string;
    imageUrl?: string;
    Fname?: string;
    Lname?: string;
    email?: string;
    username?: string;
    password?: string;
    typeStaff?: string;
    dateOfBirth?: string;
    image?: string;
    adress?: string;
    phone?: string;
  };
  input?: IInput;
  onSubmit?: (data: IFormData) => void | Promise<void>;
  confirmClick?: () => Promise<void>;
  options?: string[];
  content?: string;
  select?: any[];
};

export type IFormData = {
  id?: number;
  name?: string;
  type?: "food" | "drink";
  description?: string;
  categoryId?: number;
  price?: number;
  imageUrl?: string;
  Fname?: string;
  Lname?: string;
  email?: string;
  username?: string;
  password?: string;
  dateOfBirth?: string;
  image?: string;
  typeStaff?: string;
  adress?: string;
  phone?: string;
};
