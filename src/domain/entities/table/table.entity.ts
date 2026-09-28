import { Utils } from 'src/shared/utils/utils';

export type TableStatus = 'FREE' | 'OCCUPIED' | 'CLOSED';

export type TableCreateDto = {
  number: number;
  capacity?: number;
  clientName?: string | null;
  status?: TableStatus;
};

export type TableWithDto = {
  id: string;
  number: number;
  capacity: number;
  status: TableStatus;
  clientName: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export class Table {
  private constructor(
    private readonly id: string,
    private number: number,
    private capacity: number,
    private status: TableStatus,
    private clientName: string | null,
    private readonly createdAt: Date,
    private updatedAt: Date,
  ) {}

  static create(dto: TableCreateDto): Table {
    return new Table(
      Utils.generateUUID(),
      dto.number,
      dto.capacity ?? 4,
      dto.status ?? 'FREE',
      dto.clientName ?? null,
      new Date(),
      new Date(),
    );
  }

  static with(dto: TableWithDto): Table {
    return new Table(
      dto.id, dto.number, dto.capacity, dto.status, dto.clientName, dto.createdAt, dto.updatedAt,
    );
  }

  getId(): string { return this.id; }
  getNumber(): number { return this.number; }
  getCapacity(): number { return this.capacity; }
  getStatus(): TableStatus { return this.status; }
  getClientName(): string | null { return this.clientName; }
  getCreatedAt(): Date { return this.createdAt; }
  getUpdatedAt(): Date { return this.updatedAt; }

  occupy(clientName?: string | null): void {
    this.status = 'OCCUPIED';
    this.clientName = clientName ?? null;
    this.updatedAt = new Date();
  }

  free(): void {
    this.status = 'FREE';
    this.clientName = null;
    this.updatedAt = new Date();
  }
}
