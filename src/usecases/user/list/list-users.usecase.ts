import { Injectable } from '@nestjs/common';
import { UserRepository } from 'src/domain/repositories/user.repository.interface';

export interface UserListItem {
  id: string;
  username: string;
  name: string;
  email: string | null;
  role: string;
  needsPasswordChange: boolean;
  active: boolean;
  deactivatedAt: Date | null;
  deletableAt: Date | null; // a partir de quando pode ser excluído
  twoFactorEnabled: boolean;
  twoFactorRequired: boolean;
  createdAt: Date;
}

@Injectable()
export class ListUsersUsecase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(): Promise<UserListItem[]> {
    const users = await this.userRepository.findAll();
    return users.map((u) => ({
      id: u.getId(),
      username: u.getUsername(),
      name: u.getName(),
      email: u.getEmail(),
      role: u.getRole(),
      needsPasswordChange: u.getNeedsPasswordChange(),
      active: u.getActive(),
      deactivatedAt: u.getDeactivatedAt(),
      deletableAt: u.getDeletableAt(),
      twoFactorEnabled: u.getTwoFactorEnabled(),
      twoFactorRequired: u.isTwoFactorRequired(),
      createdAt: u.getCreatedAt(),
    }));
  }
}
