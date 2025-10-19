import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';
import { CountryQueryDto } from './dto/country-query.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CountriesService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly countrySelectFields = {
    id: true,
    code: true,
    name: true,
    createdAt: true,
  };

  private readonly countrySelectForUsers = {
    id: true,
    code: true,
    name: true,
  };

  private async checkCountryExists(
    code: string,
    name: string,
    excludeId?: string,
  ) {
    const where = {
      OR: [
        { code: { equals: code, mode: 'insensitive' as const } },
        { name: { equals: name, mode: 'insensitive' as const } },
      ],
      ...(excludeId && { id: { not: excludeId } }),
    };

    const existing = await this.prisma.country.findFirst({ where });

    if (existing) {
      if (existing.code.toLowerCase() === code.toLowerCase()) {
        throw new BadRequestException(
          `Country with code "${code}" already exists`,
        );
      }
      if (existing.name.toLowerCase() === name.toLowerCase()) {
        throw new BadRequestException(
          `Country with name "${name}" already exists`,
        );
      }
    }
  }

  async create(createCountryDto: CreateCountryDto) {
    const { code, name } = createCountryDto;

    await this.checkCountryExists(code, name);

    const country = await this.prisma.country.create({
      data: {
        code: code.toUpperCase(),
        name,
      },
      select: this.countrySelectFields,
    });

    return {
      message: 'Country created successfully',
      data: country,
    };
  }

  async findAll(query: CountryQueryDto) {
    const {
      search,
      page = 1,
      limit = 10,
      sortBy = 'asc' as const,
      sortField = 'name',
    } = query;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;
    const orderBy = { [sortField]: sortBy };

    const [countries, total] = await this.prisma.$transaction([
      this.prisma.country.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          ...this.countrySelectFields,
          _count: {
            select: {
              users: true,
            },
          },
        },
      }),
      this.prisma.country.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: countries.map((country) => ({
        ...country,
        usersCount: country._count.users,

        _count: undefined,
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findOne(id: string) {
    const country = await this.prisma.country.findUnique({
      where: { id },
      select: {
        ...this.countrySelectFields,
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    if (!country) {
      throw new NotFoundException(`Country with ID "${id}" not found`);
    }

    return {
      data: {
        ...country,
        usersCount: country._count.users,
      },
    };
  }

  async update(id: string, updateCountryDto: UpdateCountryDto) {
    const { code, name } = updateCountryDto;

    const existingCountry = await this.prisma.country.findUnique({
      where: { id },
      select: { id: true, code: true, name: true },
    });

    if (!existingCountry) {
      throw new NotFoundException(`Country with ID "${id}" not found`);
    }

    if (code || name) {
      await this.checkCountryExists(
        code || existingCountry.code,
        name || existingCountry.name,
        id,
      );
    }

    const updateData: any = {};
    if (code !== undefined) updateData.code = code.toUpperCase();
    if (name !== undefined) updateData.name = name;

    const country = await this.prisma.country.update({
      where: { id },
      data: updateData,
      select: this.countrySelectFields,
    });

    return {
      message: 'Country updated successfully',
      data: country,
    };
  }

  async remove(id: string) {
    const existingCountry = await this.prisma.country.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    if (!existingCountry) {
      throw new NotFoundException(`Country with ID "${id}" not found`);
    }

    const totalConnections = existingCountry._count.users;

    if (totalConnections > 0) {
      throw new BadRequestException(
        `Cannot delete country "${existingCountry.name}". It has ${existingCountry._count.users} user(s) and  `,
      );
    }

    await this.prisma.country.delete({
      where: { id },
    });

    return {
      message: `Country "${existingCountry.name}" has been deleted successfully`,
    };
  }

  async findAllForUsers() {
    const countries = await this.prisma.country.findMany({
      select: this.countrySelectForUsers,
      orderBy: { name: 'asc' },
    });

    return {
      data: countries,
      total: countries.length,
    };
  }

  async findOneForUsers(id: string) {
    const country = await this.prisma.country.findUnique({
      where: { id },
      select: this.countrySelectForUsers,
    });

    if (!country) {
      throw new NotFoundException(`Country with ID "${id}" not found`);
    }

    return {
      data: country,
    };
  }

  async getStats() {
    const [totalCountries, countriesWithUsers, countriesWithRestaurants] =
      await this.prisma.$transaction([
        this.prisma.country.count(),
        this.prisma.country.count({
          where: {
            users: {
              some: {},
            },
          },
        }),
        this.prisma.country.count({
          where: {},
        }),
      ]);

    const topCountriesByUsers = await this.prisma.country.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        _count: {
          select: {
            users: true,
          },
        },
      },
      orderBy: {
        users: {
          _count: 'desc',
        },
      },
      take: 5,
    });

    return {
      totalCountries,
      countriesWithUsers,
      countriesWithRestaurants,
      countriesWithoutData:
        totalCountries - Math.max(countriesWithUsers, countriesWithRestaurants),
      topCountries: topCountriesByUsers.map((country) => ({
        ...country,
        usersCount: country._count.users,
       
      })),
    };
  }

  async findByCode(code: string) {
    const country = await this.prisma.country.findUnique({
      where: { code: code.toUpperCase() },
      select: this.countrySelectForUsers,
    });

    if (!country) {
      throw new NotFoundException(`Country with code "${code}" not found`);
    }

    return {
      data: country,
    };
  }
}
