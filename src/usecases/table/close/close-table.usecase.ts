import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { TableRepository } from 'src/domain/repositories/table.repository.interface';
import { OrderRepository } from 'src/domain/repositories/order.repository.interface';
import { ClosedAccountRepository } from 'src/domain/repositories/closed-account.repository.interface';
import { AuditLogRepository } from 'src/domain/repositories/audit-log.repository.interface';
import {
  ClosedAccount,
  AccountPayment,
  PaymentMethod,
  PAYMENT_METHODS,
  MAX_INSTALLMENTS,
} from 'src/domain/entities/closed-account/closed-account.entity';
import { AuditLog } from 'src/domain/entities/audit-log/audit-log.entity';

const SERVICE_FEE_RATE = 0.1;

const METHOD_LABEL: Record<PaymentMethod, string> = {
  DINHEIRO: 'Dinheiro',
  PIX: 'Pix',
  DEBITO: 'Débito',
  CREDITO: 'Crédito',
};

const brl = (cents: number) => `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`;

@Injectable()
export class CloseTableUsecase {
  constructor(
    private readonly tableRepository: TableRepository,
    private readonly orderRepository: OrderRepository,
    private readonly closedAccountRepository: ClosedAccountRepository,
    private readonly auditLogRepository: AuditLogRepository,
  ) {}

  async execute(
    tableId: string,
    actor: string,
    actorRole: string,
    payments: AccountPayment[] = [],
  ): Promise<{ success: boolean; total: number }> {
    const table = await this.tableRepository.findById(tableId);
    if (!table) throw new NotFoundException('Mesa não encontrada');
    if (table.getStatus() !== 'OCCUPIED') throw new BadRequestException('Esta mesa não está aberta');

    const orders = await this.orderRepository.findByTableId(tableId);

    // Regra de negócio: não fechar com pedidos ainda na cozinha (exceto administrador)
    const inKitchen = orders.filter((o) => o.getStatus() === 'PENDING' || o.getStatus() === 'PREPARING');
    if (inKitchen.length > 0 && actorRole !== 'ADMIN') {
      throw new BadRequestException('Há pedidos ainda em preparo nesta mesa. Aguarde a cozinha finalizar para fechar a conta.');
    }

    const subtotal = orders.reduce((s, o) => s + o.getTotalAmount(), 0);
    const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE);
    const total = subtotal + serviceFee;
    const firstOrderAt = orders.length ? orders[0].getCreatedAt() : null;

    // Regra de negócio: a soma das formas de pagamento deve fechar exatamente o total
    const paid = total > 0 ? this.validatePayments(payments, total) : [];

    // Registro permanente da conta (histórico de mesas fechadas)
    const account = ClosedAccount.create({
      tableId,
      tableIdentifier: table.getIdentifier(),
      clientName: table.getClientName(),
      openedAt: table.getOpenedAt() ?? firstOrderAt ?? new Date(),
      closedBy: actor,
      subtotal,
      serviceFee,
      payments: paid,
    });
    await this.closedAccountRepository.create(account);
    await this.orderRepository.closeByTableId(tableId, account.getId());

    table.free();
    await this.tableRepository.update(table);

    const paidWith = paid
      .map((p) => `${METHOD_LABEL[p.method]}${p.installments > 1 ? ` ${p.installments}x` : ''} ${brl(p.amount)}`)
      .join(' + ');
    await this.auditLogRepository.create(
      AuditLog.create('CONTA_FECHADA', actor, `Mesa ${table.getIdentifier()} — Total ${brl(account.getTotal())}${paidWith ? ` (${paidWith})` : ''}`),
    );
    return { success: true, total: account.getTotal() };
  }

  private validatePayments(payments: AccountPayment[], total: number): AccountPayment[] {
    if (!Array.isArray(payments) || payments.length === 0) {
      throw new BadRequestException('Informe a forma de pagamento da conta');
    }
    const normalized = payments.map((p) => {
      if (!PAYMENT_METHODS.includes(p?.method)) throw new BadRequestException('Forma de pagamento inválida');
      if (!Number.isInteger(p.amount) || p.amount <= 0) throw new BadRequestException('Valor de pagamento inválido');
      const installments = p.method === 'CREDITO' ? Number(p.installments ?? 1) : 1;
      if (!Number.isInteger(installments) || installments < 1 || installments > MAX_INSTALLMENTS) {
        throw new BadRequestException(`O parcelamento deve ser de 1 a ${MAX_INSTALLMENTS} vezes`);
      }
      return { method: p.method, amount: p.amount, installments };
    });
    const sum = normalized.reduce((s, p) => s + p.amount, 0);
    if (sum !== total) {
      throw new BadRequestException(`A soma dos pagamentos (${brl(sum)}) precisa ser igual ao total da conta (${brl(total)})`);
    }
    return normalized;
  }
}
