import { Utils } from 'src/shared/utils/utils';

export type UserRole = 'ADMIN' | 'GERENTE' | 'GARCOM' | 'COZINHA';

export const USER_ROLES: UserRole[] = ['ADMIN', 'GERENTE', 'GARCOM', 'COZINHA'];

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
    this.active = active;
    this.updatedAt = new Date();
  }
}
