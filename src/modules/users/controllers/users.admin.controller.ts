import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from '../users.service';

import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from 'src/modules/auth/guards/permission.guard';
import {
  RequireRead,
  RequireWrite,
  RequireDelete,
} from 'src/modules/auth/decorator/permission.decorator';
import { SignUpUserDto } from 'src/modules/auth/dto/sign-up-user.dto';
import { UserQueryDto } from '../dto/user-query.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { IsActiveGuard } from 'src/modules/auth/guards/is-active.guard';

@Controller('admin/users')
@UseGuards(AuthGuard('jwt-access'), IsActiveGuard, PermissionsGuard)
export class UsersAdminController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequireWrite('users')
  create(@Body() createUserDto: SignUpUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @Get()
  @RequireRead('users')
  findAll(@Query() query: UserQueryDto) {
    return this.usersService.findAll(query);
  }
 

  @Get(':id')
  @RequireRead('users')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @RequireWrite('users')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Patch(':id/deactivate')
  @RequireWrite('users')
  deactivateUser(@Param('id') id: string) {
    return this.usersService.deactivateUser(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @RequireDelete('users')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
