import { Utils } from 'src/shared/utils/utils';

export type UserRole = 'ADMIN' | 'GERENTE' | 'GARCOM' | 'KITCHEN';

export type UserCreateDto = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
};

export type UserWithDto = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
};

export class User {
  private constructor(
    private readonly id: string,
    private name: string,
    private readonly email: string,
    private password: string,
    private role: UserRole,
    private readonly createdAt: Date,
    private updatedAt: Date,
  ) {}

  static create({ name, email, password, role }: UserCreateDto): User {
    return new User(
      Utils.generateUUID(),
      name,
      email,
      password,
      role,
      new Date(),
      new Date(),
    );
  }

  static with(dto: UserWithDto): User {
    return new User(
      dto.id,
      dto.name,
      dto.email,
      dto.password,
      dto.role,
      dto.createdAt,
      dto.updatedAt,
    );
  }

  getId(): string { return this.id; }
  getName(): string { return this.name; }
  getEmail(): string { return this.email; }
  getPassword(): string { return this.password; }
  getRole(): UserRole { return this.role; }
  getCreatedAt(): Date { return this.createdAt; }
  getUpdatedAt(): Date { return this.updatedAt; }

  updateName(name: string): void {
    this.name = name;
    this.updatedAt = new Date();
  }

  updatePassword(password: string): void {
    this.password = password;
    this.updatedAt = new Date();
  }

  updateRole(role: UserRole): void {
    this.role = role;
    this.updatedAt = new Date();
  }
}
