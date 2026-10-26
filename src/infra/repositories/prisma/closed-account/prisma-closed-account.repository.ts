import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infra/services/database/prisma/prisma.service';
import { ClosedAccountRepository } from 'src/domain/repositories/closed-account.repository.interface';
import { ClosedAccount, PaymentMethod } from 'src/domain/entities/closed-account/closed-account.entity';

@Injectable()
export class PrismaClosedAccountRepository implements ClosedAccountRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toEntity(raw: any): ClosedAccount {
    return ClosedAccount.with({
      id: raw.id,
      tableId: raw.tableId,
      tableIdentifier: raw.tableIdentifier,
      clientName: raw.clientName,
      openedAt: raw.openedAt,
      closedAt: raw.closedAt,
      closedBy: raw.closedBy,
      subtotal: raw.subtotal,
      serviceFee: raw.serviceFee,
      total: raw.total,
      payments: (raw.payments ?? []).map((p: any) => ({
        method: p.method as PaymentMethod,
        amount: p.amount,
        installments: p.installments,
      })),
    });
  }

  async create(account: ClosedAccount): Promise<void> {
    await this.prisma.closedAccount.create({
      data: {
        id: account.getId(),
        tableId: account.getTableId(),
        tableIdentifier: account.getTableIdentifier(),
        clientName: account.getClientName(),
        openedAt: account.getOpenedAt(),
        closedAt: account.getClosedAt(),
        closedBy: account.getClosedBy(),
        subtotal: account.getSubtotal(),
        serviceFee: account.getServiceFee(),
        total: account.getTotal(),
        payments: { create: account.getPayments() },
      },
    });
  }

  async findBetween(from: Date, to: Date): Promise<ClosedAccount[]> {
    const rows = await this.prisma.closedAccount.findMany({
      where: { closedAt: { gte: from, lte: to } },
      include: { payments: { orderBy: { createdAt: 'asc' } } },
      orderBy: { closedAt: 'desc' },
    });
    return rows.map((r: any) => this.toEntity(r));
  }
}
