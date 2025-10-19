import { Controller, Get, UseGuards, Req, Patch, Body } from '@nestjs/common';
import { AdminsService } from './admins.service';
import { AuthGuard } from '@nestjs/passport';
import { IsActiveGuard } from '../auth/guards/is-active.guard';
import { UpdateMyProfileDto } from './dto/update-my-profile.dto';
import { Request } from 'express';

 
@Controller('admin/my-profile')
@UseGuards(AuthGuard('jwt-access'), IsActiveGuard)
export class MyAdminController {
  constructor(private readonly adminsService: AdminsService) {}

  
  @Get()
  async getMyProfile(@Req() req: Request) {
    const adminId = (req as any).user.id;
    return this.adminsService.getMyProfile(adminId);
  }

    
  @Patch()
  async updateMyProfile(
    @Req() req: Request,
    @Body() updateDto: UpdateMyProfileDto,
  ) {
    const adminId = (req as any).user.id;
    return this.adminsService.updateMyProfile(adminId, updateDto);
  }

   
 
}
