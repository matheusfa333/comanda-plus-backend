import { Utils } from 'src/shared/utils/utils';

export type PaymentMethod = 'DINHEIRO' | 'PIX' | 'DEBITO' | 'CREDITO';
export const PAYMENT_METHODS: PaymentMethod[] = ['DINHEIRO', 'PIX', 'DEBITO', 'CREDITO'];
export const MAX_INSTALLMENTS = 12;

export type AccountPayment = {
  method: PaymentMethod;
  amount: number; // centavos
  installments: number; // parcelas (1 para tudo que não é crédito)
};

export type PaymentSummary = { method: PaymentMethod; count: number; amount: number }[];

// Soma por forma de pagamento (na ordem fixa, só as que tiveram uso)
export function summarizePayments(payments: AccountPayment[]): PaymentSummary {
  return PAYMENT_METHODS.map((method) => {
    const list = payments.filter((p) => p.method === method);
    return { method, count: list.length, amount: list.reduce((s, p) => s + p.amount, 0) };
  }).filter((m) => m.count > 0);
}

export type ClosedAccountCreateDto = {
  tableId: string;
  tableIdentifier: string;
  clientName: string | null;
  openedAt: Date;
  closedBy: string;
  subtotal: number;
  serviceFee: number;
  payments: AccountPayment[];
};

export type ClosedAccountWithDto = ClosedAccountCreateDto & {
  id: string;
  closedAt: Date;
  total: number;
};

export class ClosedAccount {
  private constructor(
    private readonly id: string,
    private readonly tableId: string,
    private readonly tableIdentifier: string,
    private readonly clientName: string | null,
    private readonly openedAt: Date,
    private readonly closedAt: Date,
    private readonly closedBy: string,
    private readonly subtotal: number,
    private readonly serviceFee: number,
    private readonly total: number,
    private readonly payments: AccountPayment[],
  ) {}

  static create(dto: ClosedAccountCreateDto): ClosedAccount {
    return new ClosedAccount(
      Utils.generateUUID(),
      dto.tableId,
      dto.tableIdentifier,
      dto.clientName,
      dto.openedAt,
      new Date(),
      dto.closedBy,
      dto.subtotal,
      dto.serviceFee,
      dto.subtotal + dto.serviceFee,
      dto.payments,
    );
  }

  static with(dto: ClosedAccountWithDto): ClosedAccount {
    return new ClosedAccount(
      dto.id, dto.tableId, dto.tableIdentifier, dto.clientName, dto.openedAt,
      dto.closedAt, dto.closedBy, dto.subtotal, dto.serviceFee, dto.total, dto.payments,
    );
  }

  getId(): string { return this.id; }
  getTableId(): string { return this.tableId; }
  getTableIdentifier(): string { return this.tableIdentifier; }
  getClientName(): string | null { return this.clientName; }
  getOpenedAt(): Date { return this.openedAt; }
  getClosedAt(): Date { return this.closedAt; }
  getClosedBy(): string { return this.closedBy; }
  getSubtotal(): number { return this.subtotal; }
  getServiceFee(): number { return this.serviceFee; }
  getTotal(): number { return this.total; }
  getPayments(): AccountPayment[] { return this.payments; }
}
