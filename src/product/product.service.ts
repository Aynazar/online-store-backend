import { ForbiddenException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { convertToSecondsUtil } from '@common/utils';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../auth/interfaces';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);
  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  save(dto: CreateProductDto, user: JwtPayload) {
    return this.prismaService.product.create({
      data: {
        title: dto.title,
        description: dto.description,
        price: dto.price,
        images: dto.images,
        categoryId: dto.categoryId,
        type: dto.type,
        brand: dto.brand,
        screen: dto.screen,
        screenSize: dto.screenSize,
        color: dto.color,
        frame: dto.frame,
        userId: user.id,
      },
    });
  }

  async findOne(id: string, isReset = false) {
    if (isReset) {
      await this.cacheManager.del(id);
    }
    const _product = await this.cacheManager.get(id);

    const product = await this.prismaService.product.findFirst({ where: { id } }).catch((err) => {
      this.logger.error(err);
      return null;
    });

    if (!_product) {
      if (!product) {
        throw new NotFoundException();
      }

      await this.cacheManager.set(id, product, convertToSecondsUtil(this.configService.get('EXPIRES_IN')));

      return product;
    }

    return product;
  }

  async delete(id: string) {
    const product = await this.prismaService.product.findFirst({ where: { id } }).catch((err) => {
      this.logger.error(err);
      return null;
    });

    await Promise.all([this.cacheManager.del(id), this.cacheManager.del(product)]);
    return this.prismaService.product.delete({ where: { id }, select: { id: true } });
  }

  findAll() {
    return this.prismaService.product.findMany();
  }
}
