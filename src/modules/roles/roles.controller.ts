import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AuthGuard } from '@nestjs/passport';
import { IsActiveGuard } from '../auth/guards/is-active.guard';
import {
  RequireDelete,
  RequireRead,
  RequireWrite,
} from '../auth/decorator/permission.decorator';
import { PermissionsGuard } from '../auth/guards/permission.guard';

@Controller('admin/roles')
@UseGuards(AuthGuard('jwt-access'), IsActiveGuard, PermissionsGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @RequireWrite('roles')
  @Post()
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @RequireRead('roles')
  @Get()
  findAll() {
    return this.rolesService.findAll();
  }

  @RequireRead('roles')
  @Get('/resources')
  resources() {
    return this.rolesService.resources();
  }

  @RequireRead('roles')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(+id);
  }

  @RequireWrite('roles')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(+id, updateRoleDto);
  }

  @RequireDelete('roles')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rolesService.remove(+id);
  }
}
