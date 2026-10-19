import { Product } from '../entities/product/product.entity';

export interface ProductRepository {
  findAll(): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  findByName(name: string): Promise<Product | null>;
  create(product: Product): Promise<void>;
  update(product: Product): Promise<void>;
  hasOrders(id: string): Promise<boolean>;
  delete(id: string): Promise<void>;
}
