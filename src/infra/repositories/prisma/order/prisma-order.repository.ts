import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infra/services/database/prisma/prisma.service';
import { OrderRepository } from 'src/domain/repositories/order.repository.interface';
import { Order } from 'src/domain/entities/order/order.entity';
import { OrderItem } from 'src/domain/entities/order-item/order-item.entity';

const ACTIVE_STATUSES = ['PENDING', 'PREPARING', 'READY', 'DELIVERED'];
const KITCHEN_STATUSES = ['PENDING', 'PREPARING', 'READY'];

@Injectable()
export class PrismaOrderRepository implements OrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toEntity(raw: any): Order {
    const items = (raw.items ?? []).map((i: any) =>
      OrderItem.with({
        id: i.id,
        productId: i.productId,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        notes: i.notes,
      }),
    );
    return Order.with({
      id: raw.id,
      tableId: raw.tableId,
      userId: raw.userId,
      status: raw.status,
      totalAmount: raw.totalAmount,
      notes: raw.notes,
      items,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  async create(order: Order): Promise<void> {
    await this.prisma.order.create({
      data: {
        id: order.getId(),
        tableId: order.getTableId(),
        userId: order.getUserId(),
        status: order.getStatus(),
        totalAmount: order.getTotalAmount(),
        notes: order.getNotes(),
        createdAt: order.getCreatedAt(),
        updatedAt: order.getUpdatedAt(),
        items: {
          create: order.getItems().map((i) => ({
            id: i.getId(),
            productId: i.getProductId(),
            quantity: i.getQuantity(),
            unitPrice: i.getUnitPrice(),
            notes: i.getNotes(),
          })),
        },
      },
    });
  }

  async findById(id: string): Promise<Order | null> {
    const raw = await this.prisma.order.findUnique({ where: { id }, include: { items: true } });
    return raw ? this.toEntity(raw) : null;
  }

  async findByTableId(tableId: string): Promise<Order[]> {
    const rows = await this.prisma.order.findMany({
      where: { tableId, status: { in: ACTIVE_STATUSES } },
      include: { items: true },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map((r: any) => this.toEntity(r));
  }

  async findActiveForKitchen(): Promise<Order[]> {
    const rows = await this.prisma.order.findMany({
      where: { status: { in: KITCHEN_STATUSES } },
      include: { items: true },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map((r: any) => this.toEntity(r));
  }

  async update(order: Order): Promise<void> {
    await this.prisma.order.update({
      where: { id: order.getId() },
      data: {
        status: order.getStatus(),
        totalAmount: order.getTotalAmount(),
        notes: order.getNotes(),
        updatedAt: order.getUpdatedAt(),
      },
    });
  }

  async closeByTableId(tableId: string): Promise<void> {
    await this.prisma.order.updateMany({
      where: { tableId, status: { in: ACTIVE_STATUSES } },
      data: { status: 'CLOSED', updatedAt: new Date() },
    });
  }
}
