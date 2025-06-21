export interface Equipment {
  id: string;
  title: string;
  price: number;
  category: string;
  images: string[];
  rating?: number;
  reviews?: number;
  status: 'available' | 'unavailable';
  description?: string;
  created_at: string;
} 