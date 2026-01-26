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
};

export type IPopUp = {
  title?: string;
  type?: "food" | "drink";
  labels?: {
    name?: string;
    type?: string;
    description?: string;
    price?: string;
    imageUrl?: string;
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
};
