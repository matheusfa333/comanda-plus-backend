import { Table } from '../entities/table/table.entity';

export interface TableRepository {
  findAll(): Promise<Table[]>;
  findById(id: string): Promise<Table | null>;
  findByNumber(number: number): Promise<Table | null>;
  create(table: Table): Promise<void>;
  update(table: Table): Promise<void>;
}
