export interface Seller {
  firstName?: string | null;
  lastName?: string | null;
  averageRating?: number | null;
  location?: string | null;
}

export interface Category {
  id: string;
  name: string;
}

export interface Image {
  imageUrl: string;
}

export interface Product {
  id: string;
  title: string;
  description?: string | null;
  brand?: string | null;
  price: number;
  condition: string;
  size?: string | null;
  categoryId: string;
  sellerId: string;
  status: string;
  views?: number;
  availableForTrade?: boolean;
  createdAt: Date;
  category?: Category;
  seller?: Seller;
  images?: Image[];
  _count?: {
    favorites?: number;
  };
}

export interface ProductRepository {
  findMany(options?: {
    skip?: number;
    take?: number;
    include?: {
      category?: boolean;
      seller?: {
        select?: {
          firstName?: boolean;
          lastName?: boolean;
          averageRating?: boolean;
          location?: boolean;
        };
      };
      images?: boolean;
      _count?: {
        select?: {
          favorites?: boolean;
        };
      };
    };
  }): Promise<Product[]>;

  findById(id: string): Promise<Product | null>;
}
