import { Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';
import * as QRCode from 'qrcode';
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';

const ISSUER = 'Comanda+ Quintal do Roger';
const RECOVERY_CODES = 8;
const RECOVERY_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sem 0/O e 1/I para não confundir
const MAX_FAILURES = 5;
const LOCK_MINUTES = 5;

// Aceita o código do app com 30s de folga para cada lado (relógio do celular adiantado/atrasado)
authenticator.options = { window: 1 };

@Injectable()
export class TwoFactorService {
  private readonly failures = new Map<string, { count: number; lockedUntil: number }>();

  generateSecret(): string {
    return authenticator.generateSecret();
  }

  async buildQrCode(username: string, secret: string): Promise<{ otpauthUrl: string; qrCode: string }> {
    const otpauthUrl = authenticator.keyuri(username, ISSUER, secret);
    const qrCode = await QRCode.toDataURL(otpauthUrl, { margin: 1, width: 240 });
    return { otpauthUrl, qrCode };
  }

  // Código de 6 dígitos gerado pelo app autenticador
  verifyCode(secret: string, code: string): boolean {
    const digits = (code || '').replace(/\D/g, '');
    if (digits.length !== 6) return false;
    try {
      return authenticator.check(digits, secret);
    } catch {
      return false;
    }
  }

  // Confere o código digitado: do app (6 dígitos) ou de recuperação (XXXX-XXXX)
  matchCode(encryptedSecret: string | null, recoveryHashes: string[], code: string): 'APP' | 'RECOVERY' | null {
    if (encryptedSecret && this.verifyCode(this.decrypt(encryptedSecret), code)) return 'APP';
    if (this.normalizeRecovery(code).length === 8 && recoveryHashes.includes(this.hashRecoveryCode(code))) return 'RECOVERY';
    return null;
  }

  generateRecoveryCodes(): { codes: string[]; hashes: string[] } {
    const codes = Array.from({ length: RECOVERY_CODES }, () => {
      const bytes = randomBytes(8);
      const chars = Array.from(bytes, (b) => RECOVERY_ALPHABET[b % RECOVERY_ALPHABET.length]).join('');
      return `${chars.slice(0, 4)}-${chars.slice(4)}`;
    });
    return { codes, hashes: codes.map((c) => this.hashRecoveryCode(c)) };
  }

  hashRecoveryCode(code: string): string {
    return createHash('sha256').update(this.normalizeRecovery(code)).digest('hex');
  }

  // O segredo fica criptografado no banco (AES-256-GCM), com chave só no .env do servidor
  encrypt(plain: string): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.key(), iv);
    const data = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
    return [iv, cipher.getAuthTag(), data].map((b) => b.toString('base64')).join(':');
  }

  decrypt(payload: string): string {
    const [iv, tag, data] = payload.split(':').map((p) => Buffer.from(p, 'base64'));
    const decipher = createDecipheriv('aes-256-gcm', this.key(), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
  }

  // Limite de tentativas: 5 códigos errados bloqueiam por 5 minutos
  minutesLocked(userId: string): number {
    const f = this.failures.get(userId);
    if (!f || f.lockedUntil <= Date.now()) return 0;
    return Math.ceil((f.lockedUntil - Date.now()) / 60000);
  }

  registerFailure(userId: string): void {
    const f = this.failures.get(userId);
    // Depois de um bloqueio vencido, a contagem recomeça do zero
    const count = (f && f.lockedUntil === 0 ? f.count : 0) + 1;
    if (count >= MAX_FAILURES) {
      this.failures.set(userId, { count: 0, lockedUntil: Date.now() + LOCK_MINUTES * 60000 });
    } else {
      this.failures.set(userId, { count, lockedUntil: 0 });
    }
  }

  clearFailures(userId: string): void {
    this.failures.delete(userId);
  }

  private normalizeRecovery(code: string): string {
    return (code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  }

  private key(): Buffer {
    const raw = process.env.TWO_FACTOR_KEY || process.env.JWT_SECRET || 'secret';
    return createHash('sha256').update(raw).digest();
  }
}
