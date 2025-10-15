import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { CommonModule } from 'src/common/common.module';
import { AuthModule } from '../auth/auth.module';
import { AdminsModule } from '../admins/admins.module';

@Module({
  controllers: [RolesController],
  providers: [RolesService],
  imports: [CommonModule, AuthModule, AdminsModule],
})
export class RolesModule {}
