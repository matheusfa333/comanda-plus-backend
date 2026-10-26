import { randomUUID } from 'crypto';

// O restaurante opera no horário de Brasília (UTC−3, sem horário de verão desde 2019).
// O servidor roda em UTC, então "o dia" precisa ser calculado com esse fuso.
const BRT_OFFSET = '-03:00';
const DAY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export class Utils {
  static generateUUID(): string {
    return randomUUID();
  }

  // Data de hoje em Brasília no formato AAAA-MM-DD
  static todayBrt(): string {
    return new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString().slice(0, 10);
  }

  // Converte "AAAA-MM-DD" (de/até, inclusivo) no intervalo [início do dia, fim do dia] em Brasília.
  // Retorna null se as datas forem inválidas.
  static dayRangeBrt(from?: string, to?: string): { from: Date; to: Date } | null {
    const start = from || Utils.todayBrt();
    const end = to || start;
    if (!DAY_REGEX.test(start) || !DAY_REGEX.test(end)) return null;
    const range = {
      from: new Date(`${start}T00:00:00.000${BRT_OFFSET}`),
      to: new Date(`${end}T23:59:59.999${BRT_OFFSET}`),
    };
    if (isNaN(range.from.getTime()) || isNaN(range.to.getTime()) || range.from > range.to) return null;
    return range;
  }
}
