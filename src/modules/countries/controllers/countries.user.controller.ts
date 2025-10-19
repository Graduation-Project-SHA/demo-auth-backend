import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { CountriesService } from '../countries.service';

@Controller('countries')
export class UsersCountriesController {
  constructor(private readonly countriesService: CountriesService) {}

  @Get()
  findAll() {
    return this.countriesService.findAllForUsers();
  }

  @Get('code/:code')
  findByCode(@Param('code') code: string) {
    return this.countriesService.findByCode(code);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.countriesService.findOneForUsers(id);
  }
}
