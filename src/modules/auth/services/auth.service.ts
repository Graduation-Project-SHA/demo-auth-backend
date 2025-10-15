import { AdminAuthSevice } from './admins.auth.service';
import { UserType } from '../dto/local-login.dto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersAuthService } from './users.auth.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly adminsAuthService: AdminAuthSevice,
    private readonly userAuthService: UsersAuthService,
  ) {}

  async localvalidate(email: string, password: string, type: UserType) {
    let user: any;
    switch (type) {
      case UserType.ADMIN:
        user = await this.adminsAuthService.validateAdmin(email, password);
        break;
      case UserType.USER:
        user = await this.userAuthService.validateUser(email, password);

        break;
      default:
        throw new UnauthorizedException('Invalid user type');
    }
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }
}
