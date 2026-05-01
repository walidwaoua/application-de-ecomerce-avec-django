export type Product = {
  id: number;
  name: string;
  image: string | null;
  description: string;
  category: string | null;
  price: number;
  countInStock: number;
};
