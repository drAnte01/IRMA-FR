export interface ICategory {
  name?: string;
  type?: "food" | "drink";
}

export type IItem = {
  name?: string;
  categoryId?: number;
  description?: string;
  price?: number;
  imageUrl?: string;
};

export type IMessage = {
  title: string;
  content: string;
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
  input?: string;
  onSubmit?: (data: IFormData) => void | Promise<void>;
  confirmClick?: () => Promise<void>;
  options?: string[];
  content?: string;
  select?: any[];
};

export type IFormData = {
  name?: string;
  type?: "food" | "drink";
  description?: string;
  categoryId?: number;
  price?: number;
  imageUrl?: string;
};
