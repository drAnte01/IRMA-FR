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
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  Fname?: string;
  Lname?: string;
  email?: string;
  position?: string;
  username?: string;
  password?: string;
  role?: "admin" | "none";
  dateOfEmployment?: string;
  createdAt?: string;
  typeStaff?: string;
  dateOfBirth?: string;
  imageURL?: string;
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
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  Fname?: string;
  Lname?: string;
  email?: string;
  position?: string;
  username?: string;
  password?: string;
  role?: "admin" | "none";
  dateOfEmployment?: string;
  createdAt?: string;
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
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  Fname?: string;
  Lname?: string;
  email?: string;
  position?: string;
  username?: string;
  password?: string;
  role?: string;
  dateOfEmployment?: string;
  createdAt?: string;
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
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    Fname?: string;
    Lname?: string;
    email?: string;
    position?: string;
    username?: string;
    password?: string;
    role?: string;
    dateOfEmployment?: string;
    createdAt?: string;
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
  roleOptions?: string[];
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
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  Fname?: string;
  Lname?: string;
  email?: string;
  position?: string;
  username?: string;
  password?: string;
  role?: "admin" | "none";
  dateOfEmployment?: string;
  createdAt?: string;
  dateOfBirth?: string;
  image?: string;
  typeStaff?: string;
  adress?: string;
  phone?: string;
};


export type OrderRow = {
    id: number;
    table: string;
    status: string;
    subtotal?: string | number;
    taxAmount?: string | number;
    totalPrice?: string | number;
    createdAt?: string;
    pdfUrl?: string;
    fileName?: string;
};

export type SalesData = {
  type: "daily" | "weekly" | "monthly" | "all";
  price: number;
}

export type IDailySalesResponse = {
  date?: string;
  totalSales?: number;
};

export type IWeeklySalesResponse = {
  weekStart?: string;
  weekEnd?: string;
  totalSales?: number;
};

export type IMonthlySalesResponse = {
  year?: number;
  month?: number;
  totalSales?: number;
};

export type IAllSalesResponse = {
  daily?: IDailySalesResponse;
  weekly?: IWeeklySalesResponse;
  monthly?: IMonthlySalesResponse;
};