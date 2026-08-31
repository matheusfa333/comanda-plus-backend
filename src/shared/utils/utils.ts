import { randomUUID } from 'crypto';

export class Utils {
  static generateUUID(): string {
    return randomUUID();
  }
}
