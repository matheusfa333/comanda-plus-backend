import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infra/services/database/prisma/prisma.service';
import { UserRepository } from 'src/domain/repositories/user.repository.interface';
import { User } from 'src/domain/entities/user/user.entity';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toEntity(raw: any): User {
    return User.with({
      id: raw.id,
      name: raw.name,
      email: raw.email,
      password: raw.password,
      role: raw.role as any,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  async create(user: User): Promise<void> {
    await this.prisma.user.create({
      data: {
        id: user.getId(),
        name: user.getName(),
        email: user.getEmail(),
        password: user.getPassword(),
        role: user.getRole(),
        createdAt: user.getCreatedAt(),
        updatedAt: user.getUpdatedAt(),
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    const raw = await this.prisma.user.findUnique({ where: { id } });
    return raw ? this.toEntity(raw) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const raw = await this.prisma.user.findUnique({ where: { email } });
    return raw ? this.toEntity(raw) : null;
  }

  async findAll(): Promise<User[]> {
    const rows = await this.prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
    return rows.map((r: any) => this.toEntity(r));
  }

  async update(user: User): Promise<void> {
    await this.prisma.user.update({
      where: { id: user.getId() },
      data: {
        name: user.getName(),
        role: user.getRole(),
        password: user.getPassword(),
        updatedAt: user.getUpdatedAt(),
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }
}
