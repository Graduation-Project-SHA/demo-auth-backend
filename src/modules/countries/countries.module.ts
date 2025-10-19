import { Module } from '@nestjs/common';
import { CountriesService } from './countries.service';
import { AdminCountriesController } from './controllers/countries.admin.controller';
import { UsersCountriesController } from './controllers/countries.user.controller';
import { AuthModule } from '../auth/auth.module';
import { AdminsModule } from '../admins/admins.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [AuthModule, AdminsModule],
  controllers: [AdminCountriesController, UsersCountriesController],
  providers: [CountriesService],
  exports: [CountriesService],
})
export class CountriesModule {}
