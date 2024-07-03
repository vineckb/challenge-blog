import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @Inject('MESSAGE_BROKER') private readonly client: ClientProxy,
  ) {}

  async updateUser(id: string, updateUserDto: CreateUserDto): Promise<User> {
    await this.usersRepository.update(id, updateUserDto);
    const updatedUser = await this.usersRepository.findOne(id);

    // Publicar evento de atualização de usuário
    this.client.emit('user_updated', updatedUser);

    return updatedUser;
  }

  async validateUser(userId: string): Promise<boolean> {
    const user = await this.usersRepository.findOne(userId);
    return !!user;
  }

  async getUser(userId: string): Promise<User> {
    return this.usersRepository.findOne(userId);
  }
}
