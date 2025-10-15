import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminsService } from './admins.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { AdminQueryDto } from './dto/admin-query.dto';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../auth/guards/permission.guard';
import {
  RequireDelete,
  RequireRead,
  RequireWrite,
} from '../auth/decorator/permission.decorator';
import { IsActiveGuard } from '../auth/guards/is-active.guard';

@Controller('admin/admins')
@UseGuards(AuthGuard('jwt-access'), IsActiveGuard, PermissionsGuard)
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @RequireWrite('admins')
  @Post()
  create(@Body() createAdminDto: CreateAdminDto) {
    return this.adminsService.create(createAdminDto);
  }

  @RequireRead('admins')
  @Get()
  findAll(@Query() AdminQueryDto: AdminQueryDto) {
    return this.adminsService.findAll(AdminQueryDto);
  }

  @RequireRead('admins')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adminsService.findOne(+id);
  }

  @RequireWrite('admins')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAdminDto: UpdateAdminDto) {
    return this.adminsService.update(+id, updateAdminDto);
  }

  @RequireDelete('admins')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adminsService.remove(+id);
  }
}
