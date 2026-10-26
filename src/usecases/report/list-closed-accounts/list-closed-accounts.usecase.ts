import { Injectable } from '@nestjs/common';
import { ClosedAccountRepository } from 'src/domain/repositories/closed-account.repository.interface';
import { OrderRepository } from 'src/domain/repositories/order.repository.interface';
import { ProductRepository } from 'src/domain/repositories/product.repository.interface';
import { UserRepository } from 'src/domain/repositories/user.repository.interface';
import { AccountPayment, PaymentSummary, summarizePayments } from 'src/domain/entities/closed-account/closed-account.entity';

export interface ClosedAccountView {
  id: string;
  tableIdentifier: string;
  clientName: string | null;
  openedAt: Date;
  closedAt: Date;
  closedBy: string;
  subtotal: number;
  serviceFee: number;
  total: number;
  divergent: boolean; // soma dos pedidos diferente do subtotal gravado, ou pagamentos diferentes do total
  payments: AccountPayment[];
  orders: {
    id: string;
    createdAt: Date;
    waiter: string;
    subtotal: number;
    items: { productName: string; isMeat: boolean; quantity: number; unitPrice: number; subtotal: number }[];
  }[];
}

export interface ClosedAccountsResult {
  accounts: ClosedAccountView[];
  summary: { count: number; subtotal: number; serviceFee: number; total: number; byPayment: PaymentSummary };
}

@Injectable()
export class ListClosedAccountsUsecase {
  constructor(
    private readonly closedAccountRepository: ClosedAccountRepository,
    private readonly orderRepository: OrderRepository,
    private readonly productRepository: ProductRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(from: Date, to: Date): Promise<ClosedAccountsResult> {
    const accounts = await this.closedAccountRepository.findBetween(from, to);
    const [orders, products, users] = await Promise.all([
      this.orderRepository.findByClosedAccountIds(accounts.map((a) => a.getId())),
      this.productRepository.findAll(),
      this.userRepository.findAll(),
    ]);
    const productById = new Map(products.map((p) => [p.getId(), p]));
    const userById = new Map(users.map((u) => [u.getId(), u]));

    const views: ClosedAccountView[] = accounts.map((a) => {
      const accountOrders = orders
        .filter((o) => o.getClosedAccountId() === a.getId())
        .map((o) => ({
          id: o.getId(),
          createdAt: o.getCreatedAt(),
          waiter: userById.get(o.getUserId())?.getName() ?? 'Usuário removido',
          subtotal: o.getTotalAmount(),
          items: o.getItems().map((it) => {
            const p = productById.get(it.getProductId());
            return {
              productName: p?.getName() ?? 'Item removido',
              isMeat: it.getWeighed(),
              quantity: it.getQuantity(),
              unitPrice: it.getUnitPrice(),
              subtotal: it.getSubtotal(),
            };
          }),
        }));
      const ordersSum = accountOrders.reduce((s, o) => s + o.subtotal, 0);
      const payments = a.getPayments();
      const paidSum = payments.reduce((s, p) => s + p.amount, 0);
      return {
        id: a.getId(),
        tableIdentifier: a.getTableIdentifier(),
        clientName: a.getClientName(),
        openedAt: a.getOpenedAt(),
        closedAt: a.getClosedAt(),
        closedBy: a.getClosedBy(),
        subtotal: a.getSubtotal(),
        serviceFee: a.getServiceFee(),
        total: a.getTotal(),
        divergent: ordersSum !== a.getSubtotal() || (payments.length > 0 && paidSum !== a.getTotal()),
        payments,
        orders: accountOrders,
      };
    });

    return {
      accounts: views,
      summary: {
        count: views.length,
        subtotal: views.reduce((s, v) => s + v.subtotal, 0),
        serviceFee: views.reduce((s, v) => s + v.serviceFee, 0),
        total: views.reduce((s, v) => s + v.total, 0),
        byPayment: summarizePayments(views.flatMap((v) => v.payments)),
      },
    };
  }
}
