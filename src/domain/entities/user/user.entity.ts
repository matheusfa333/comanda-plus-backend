import { Utils } from 'src/shared/utils/utils';

export type UserRole = 'ADMIN' | 'GERENTE' | 'GARCOM' | 'COZINHA';

export const USER_ROLES: UserRole[] = ['ADMIN', 'GERENTE', 'GARCOM', 'COZINHA'];

// Um usuário só pode ser excluído depois de ficar desativado por este período
export const USER_DELETE_GRACE_DAYS = 30;

export type UserCreateDto = {
  username: string;
  name: string;
  email?: string | null;
  password: string;
  role: UserRole;
  needsPasswordChange?: boolean;
};

export type UserWithDto = {
  id: string;
  username: string;
  name: string;
  email?: string | null;
  password: string;
  role: UserRole;
  needsPasswordChange: boolean;
  active: boolean;
  deactivatedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export class User {
  private constructor(
    private readonly id: string,
    private username: string,
    private name: string,
    private email: string | null,
    private password: string,
    private role: UserRole,
    private needsPasswordChange: boolean,
    private active: boolean,
    private deactivatedAt: Date | null,
    private readonly createdAt: Date,
    private updatedAt: Date,
  ) {}

  static create({ username, name, email, password, role, needsPasswordChange }: UserCreateDto): User {
    return new User(
      Utils.generateUUID(),
      username,
      name,
      email ?? null,
      password,
      role,
      needsPasswordChange ?? true,
      true,
      null,
      new Date(),
      new Date(),
    );
  }

  static with(dto: UserWithDto): User {
    return new User(
      dto.id,
      dto.username,
      dto.name,
      dto.email ?? null,
      dto.password,
      dto.role,
      dto.needsPasswordChange,
      dto.active,
      dto.deactivatedAt ?? null,
      dto.createdAt,
      dto.updatedAt,
    );
  }

  getId(): string { return this.id; }
  getUsername(): string { return this.username; }
  getName(): string { return this.name; }
  getEmail(): string | null { return this.email; }
  getPassword(): string { return this.password; }
  getRole(): UserRole { return this.role; }
  getNeedsPasswordChange(): boolean { return this.needsPasswordChange; }
  getActive(): boolean { return this.active; }
  getDeactivatedAt(): Date | null { return this.deactivatedAt; }

  // Data a partir da qual o usuário pode ser excluído (null = ativo, não pode excluir)
  getDeletableAt(): Date | null {
    if (this.active) return null;
    // Usuários desativados antes desta regra não têm a data: usa a última alteração
    const since = this.deactivatedAt ?? this.updatedAt;
    return new Date(since.getTime() + USER_DELETE_GRACE_DAYS * 24 * 60 * 60 * 1000);
  }
  getCreatedAt(): Date { return this.createdAt; }
  getUpdatedAt(): Date { return this.updatedAt; }

  updateName(name: string): void {
    this.name = name;
    this.updatedAt = new Date();
  }

  updatePassword(password: string): void {
    this.password = password;
    this.needsPasswordChange = false;
    this.updatedAt = new Date();
  }

  requirePasswordChange(): void {
    this.needsPasswordChange = true;
    this.updatedAt = new Date();
  }

  updateRole(role: UserRole): void {
    this.role = role;
    this.updatedAt = new Date();
  }

  setActive(active: boolean): void {
    if (this.active !== active) this.deactivatedAt = active ? null : new Date();
    this.active = active;
    this.updatedAt = new Date();
  }
}
