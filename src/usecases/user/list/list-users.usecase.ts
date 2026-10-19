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
      createdAt: u.getCreatedAt(),
    }));
  }
}
