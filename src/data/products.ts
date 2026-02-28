export interface Product {
  id: string;
  name: string;
  category: string;
  pricePerPiece: number;
  piecesPerSeries: number;
  sizes: string[];
  colors: string[];
  media: { type: 'image' | 'video', url: string }[];
  isNew?: boolean;
  fabricInfo?: string;
}

export const products: Product[] = [];
