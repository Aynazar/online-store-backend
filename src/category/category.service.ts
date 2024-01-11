import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { JwtPayload } from '../auth/interfaces';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

@Injectable()
export class CategoryService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}
  save(dto: CreateCategoryDto, user: JwtPayload) {
    return this.prismaService.category.create({
      data: {
        title: dto.title,
        images: dto.images,
        description: dto.description,
        userId: user.id,
      },
    });
  }

  async findOne(id: string) {
    const category = await this.prismaService.category.findFirst({ where: { id } });

    if (category) {
      return category;
    }

    throw new NotFoundException('Эта категория не найдена');
  }

  async delete(id: string) {
    const category = await this.prismaService.category.findFirst({ where: { id } });

    if (!category) {
      throw new ForbiddenException();
    }

    return this.prismaService.category.delete({ where: { id }, select: { id: true } });
  }

  findAll() {
    return this.prismaService.category.findMany();
  }
}
