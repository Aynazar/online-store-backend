import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { convertToSecondsUtil } from '@common/utils';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);
  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  save(dto: CreateProductDto, user: User) {
    return this.prismaService.product.create({
      data: {
        title: dto.title,
        description: dto.description,
        price: dto.price,
        collection: dto.collection,
        images: dto.images,
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
}
