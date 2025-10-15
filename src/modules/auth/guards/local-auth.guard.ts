import {
  Injectable,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { LocalLoginDto } from '../dto/local-login.dto';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const body = request.body;

    if (!body) {
      throw new BadRequestException('Request body is required');
    }

    const dto = plainToInstance(LocalLoginDto, body);

    const errors = await validate(dto);

    if (errors.length > 0) {
      const validationErrors = errors
        .map((err) => (err.constraints ? Object.values(err.constraints) : []))
        .flat();
      throw new BadRequestException(validationErrors);
    }

    const result = (await super.canActivate(context)) as boolean;

    return result;
  }
}
