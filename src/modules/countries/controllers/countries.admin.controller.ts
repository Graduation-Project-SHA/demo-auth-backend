// src/modules/countries/controllers/admin.countries.controller.ts
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
import { CountriesService } from '../countries.service';
import { CreateCountryDto } from '../dto/create-country.dto';
import { UpdateCountryDto } from '../dto/update-country.dto';
import { CountryQueryDto } from '../dto/country-query.dto';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from 'src/modules/auth/guards/permission.guard';
import {
  RequireRead,
  RequireWrite,
  RequireDelete,
} from 'src/modules/auth/decorator/permission.decorator';
import { IsActiveGuard } from 'src/modules/auth/guards/is-active.guard';

@Controller('admin/countries')
@UseGuards(AuthGuard('jwt-access'), IsActiveGuard, PermissionsGuard)
export class AdminCountriesController {
  constructor(private readonly countriesService: CountriesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequireWrite('countries')
  create(@Body() createCountryDto: CreateCountryDto) {
    return this.countriesService.create(createCountryDto);
  }

  @Get()
  @RequireRead('countries')
  findAll(@Query() query: CountryQueryDto) {
    return this.countriesService.findAll(query);
  }

  @Get('stats')
  @RequireRead('countries')
  getStats() {
    return this.countriesService.getStats();
  }

  @Get('code/:code')
  @RequireRead('countries')
  findByCode(@Param('code') code: string) {
    return this.countriesService.findByCode(code);
  }

  @Get(':id')
  @RequireRead('countries')
  findOne(@Param('id') id: string) {
    return this.countriesService.findOne(id);
  }

  @Patch(':id')
  @RequireWrite('countries')
  update(@Param('id') id: string, @Body() updateCountryDto: UpdateCountryDto) {
    return this.countriesService.update(id, updateCountryDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @RequireDelete('countries')
  remove(@Param('id') id: string) {
    return this.countriesService.remove(id);
  }
}
