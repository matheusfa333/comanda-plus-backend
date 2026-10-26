import { ClosedAccount } from '../entities/closed-account/closed-account.entity';

export interface ClosedAccountRepository {
  create(account: ClosedAccount): Promise<void>;
  findBetween(from: Date, to: Date): Promise<ClosedAccount[]>;
}
