import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TokenService } from './services/token.service';
import { FileUploadService } from './services/file-upload.service';
import { UploadsController } from './controllers/uploads.controller';

@Module({
  imports: [JwtModule.register({}), ConfigModule],
  controllers: [UploadsController],
  providers: [TokenService, FileUploadService],
  exports: [TokenService, FileUploadService],
})
export class CommonModule {}
