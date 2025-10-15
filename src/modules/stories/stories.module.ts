import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CommonModule } from 'src/common/common.module';
import { StoriesService } from './stories.service';
import { StoriesUserController } from './controllers/stories.user.controller';
import { StoriesCoachController } from './controllers/stories.coach.controller';
import { StoriesAdminController } from './controllers/stories.admin.controller';
import { AuthModule } from '../auth/auth.module';
import { AdminsModule } from '../admins/admins.module';

@Module({
  imports: [PrismaModule, CommonModule, AuthModule, AdminsModule],
  controllers: [
    StoriesUserController,
    StoriesCoachController,
    StoriesAdminController,
  ],
  providers: [StoriesService],
  exports: [StoriesService],
})
export class StoriesModule {}
