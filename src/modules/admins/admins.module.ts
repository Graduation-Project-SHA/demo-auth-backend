import { Module } from '@nestjs/common';
import { AdminsService } from './admins.service';
import { AdminsController } from './admins.controller';
import { MyAdminController } from './my-admin.controller';
import { CommonModule } from 'src/common/common.module';

@Module({
  controllers: [AdminsController, MyAdminController],
  providers: [AdminsService],
  exports: [AdminsService],
  imports: [CommonModule],
})
export class AdminsModule {}
