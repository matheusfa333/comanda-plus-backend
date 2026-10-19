import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infra/services/database/prisma/prisma.service';
import { TableRepository } from 'src/domain/repositories/table.repository.interface';
import { Table } from 'src/domain/entities/table/table.entity';

@Injectable()
export class PrismaTableRepository implements TableRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toEntity(raw: any): Table {
    return Table.with({
      id: raw.id,
      identifier: raw.identifier,
      capacity: raw.capacity,
      status: raw.status,
      clientName: raw.clientName,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  async findAll(): Promise<Table[]> {
    const rows = await this.prisma.table.findMany({ orderBy: { createdAt: 'asc' } });
    return rows.map((r: any) => this.toEntity(r));
  }

  async findById(id: string): Promise<Table | null> {
    const raw = await this.prisma.table.findUnique({ where: { id } });
    return raw ? this.toEntity(raw) : null;
  }

  async findByIdentifier(identifier: string): Promise<Table | null> {
    const raw = await this.prisma.table.findUnique({ where: { identifier } });
    return raw ? this.toEntity(raw) : null;
  }

  async create(table: Table): Promise<void> {
    await this.prisma.table.create({
      data: {
        id: table.getId(),
        identifier: table.getIdentifier(),
        capacity: table.getCapacity(),
        status: table.getStatus(),
        clientName: table.getClientName(),
        createdAt: table.getCreatedAt(),
        updatedAt: table.getUpdatedAt(),
      },
    });
  }

  async update(table: Table): Promise<void> {
    await this.prisma.table.update({
      where: { id: table.getId() },
      data: {
        status: table.getStatus(),
        clientName: table.getClientName(),
        capacity: table.getCapacity(),
        updatedAt: table.getUpdatedAt(),
      },
    });
  }
}
