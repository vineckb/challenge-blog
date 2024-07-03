import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class UsersService {
  constructor(@Inject('AUTH_SERVICE') private readonly client: ClientProxy) {}

  async validateUser(userId: string): Promise<boolean> {
    return firstValueFrom(
      this.client.send({ cmd: 'validate_user' }, { userId }),
    );
  }

  async getUser(userId: string): Promise<any> {
    return firstValueFrom(this.client.send({ cmd: 'get_user' }, { userId }));
  }
}
