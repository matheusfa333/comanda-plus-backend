import { Injectable } from '@nestjs/common';
import { OrderRepository } from 'src/domain/repositories/order.repository.interface';
import { ProductRepository } from 'src/domain/repositories/product.repository.interface';
import { UserRepository } from 'src/domain/repositories/user.repository.interface';
import { ClosedAccountRepository } from 'src/domain/repositories/closed-account.repository.interface';
import { summarizePayments, PaymentSummary } from 'src/domain/entities/closed-account/closed-account.entity';

const SERVICE_FEE_RATE = 0.1;

export interface ReportsView {
  from: Date;
  to: Date;
  revenue: { subtotal: number; serviceFee: number; total: number; accounts: number };
  topEmployees: { name: string; username: string; subtotal: number; orders: number }[];
  topBeers: { name: string; quantity: number; subtotal: number }[];
  topMeats: { name: string; grams: number; subtotal: number }[];
  byCategory: { category: string; subtotal: number }[];
  averageTicket: number; // por conta fechada (com taxa)
  byPayment: PaymentSummary; // formas de pagamento das contas fechadas no período
}

@Injectable()
export class GetReportsUsecase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly productRepository: ProductRepository,
    private readonly userRepository: UserRepository,
    private readonly closedAccountRepository: ClosedAccountRepository,
  ) {}

  async execute(from: Date, to: Date): Promise<ReportsView> {
    const [orders, products, users, closedAccounts] = await Promise.all([
      this.orderRepository.findClosedBetween(from, to),
      this.productRepository.findAll(),
      this.userRepository.findAll(),
      this.closedAccountRepository.findBetween(from, to),
    ]);
    const productById = new Map(products.map((p) => [p.getId(), p]));
    const userById = new Map(users.map((u) => [u.getId(), u]));

    const subtotal = orders.reduce((s, o) => s + o.getTotalAmount(), 0);
    const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE);

    // Contas fechadas no período (pedidos antigos, sem conta registrada, agrupados pelo instante do fechamento)
    const accounts = new Set(orders.map((o) => o.getClosedAccountId() ?? `${o.getTableId()}|${o.getUpdatedAt().getTime()}`)).size;

    // Funcionário que mais vendeu
    const byEmployee = new Map<string, { subtotal: number; orders: number }>();
    for (const o of orders) {
      const cur = byEmployee.get(o.getUserId()) ?? { subtotal: 0, orders: 0 };
      cur.subtotal += o.getTotalAmount();
      cur.orders += 1;
      byEmployee.set(o.getUserId(), cur);
    }
    const topEmployees = [...byEmployee.entries()]
      .map(([userId, v]) => ({
        name: userById.get(userId)?.getName() ?? 'Usuário removido',
        username: userById.get(userId)?.getUsername() ?? '-',
        ...v,
      }))
      .sort((a, b) => b.subtotal - a.subtotal);

    // Itens: cervejas, carnes e categorias
    const beers = new Map<string, { quantity: number; subtotal: number }>();
    const meats = new Map<string, { grams: number; subtotal: number }>();
    const categories = new Map<string, number>();
    for (const o of orders) {
      for (const it of o.getItems()) {
        const p = productById.get(it.getProductId());
        if (!p) continue;
        const sub = it.getSubtotal();
        categories.set(p.getCategory(), (categories.get(p.getCategory()) ?? 0) + sub);
        if (p.getIsMeat()) {
          const m = meats.get(p.getName()) ?? { grams: 0, subtotal: 0 };
          m.grams += it.getQuantity();
          m.subtotal += sub;
          meats.set(p.getName(), m);
        } else if (p.getCategory() === 'BEBIDA' && /cerveja/i.test(p.getName())) {
          const b = beers.get(p.getName()) ?? { quantity: 0, subtotal: 0 };
          b.quantity += it.getQuantity();
          b.subtotal += sub;
          beers.set(p.getName(), b);
        }
      }
    }

    return {
      from,
      to,
      revenue: { subtotal, serviceFee, total: subtotal + serviceFee, accounts },
      topEmployees,
      topBeers: [...beers.entries()].map(([name, v]) => ({ name, ...v })).sort((a, b) => b.quantity - a.quantity),
      topMeats: [...meats.entries()].map(([name, v]) => ({ name, ...v })).sort((a, b) => b.grams - a.grams),
      byCategory: [...categories.entries()]
        .map(([category, sub]) => ({ category, subtotal: sub }))
        .sort((a, b) => b.subtotal - a.subtotal),
      averageTicket: accounts > 0 ? Math.round((subtotal + serviceFee) / accounts) : 0,
      byPayment: summarizePayments(closedAccounts.flatMap((a) => a.getPayments())),
    };
  }
}
