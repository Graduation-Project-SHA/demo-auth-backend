import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './controllers/users.user.controller';
import { UsersAdminController } from './controllers/users.admin.controller';
import { AuthModule } from '../auth/auth.module';
import { AdminsModule } from '../admins/admins.module';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [forwardRef(() => AuthModule), AdminsModule ,CommonModule],
  controllers: [UsersController, UsersAdminController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
