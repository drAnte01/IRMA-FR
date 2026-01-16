export interface ICategory {
  name: string;
  type?: "food" | "drink";
}

export type IMessage = {
  title: string;
  content: string;
};

export type IPopUp = {
  title?: string;
  type?: "food" | "drink";
  labels?: { name: string; type: string };
  input?: string;
  onSubmit?: (data: ICategory) => void | Promise<void>;
  confirmClick?: () => Promise<void>;
  options?: string[];
  content?: string;
};
