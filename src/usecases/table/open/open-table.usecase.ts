import { Injectable, BadRequestException } from '@nestjs/common';
import { TableRepository } from 'src/domain/repositories/table.repository.interface';
import { Table } from 'src/domain/entities/table/table.entity';

@Injectable()
export class OpenTableUsecase {
  constructor(private readonly tableRepository: TableRepository) {}

  async execute(dto: {
    number: number;
    capacity?: number;
    clientName?: string | null;
  }): Promise<{ id: string; message: string }> {
    if (!dto.number || dto.number <= 0) {
      throw new BadRequestException('Número da mesa inválido');
    }

    const existing = await this.tableRepository.findByNumber(dto.number);

    if (existing) {
      if (existing.getStatus() === 'OCCUPIED') {
        throw new BadRequestException(`A mesa ${dto.number} já está ocupada`);
      }
      existing.occupy(dto.clientName);
      await this.tableRepository.update(existing);
      return { id: existing.getId(), message: `Mesa ${dto.number} aberta` };
    }

    const table = Table.create({
      number: dto.number,
      capacity: dto.capacity,
      clientName: dto.clientName,
      status: 'OCCUPIED',
    });
    await this.tableRepository.create(table);
    return { id: table.getId(), message: `Mesa ${dto.number} aberta` };
  }
}
