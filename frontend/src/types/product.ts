export type Product = {
  id: number;
  name: string;
  image: string | null;
  description: string;
  brand: string | null;
  category: string | null;
  price: number;
  countInStock: number;
};
