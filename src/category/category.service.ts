import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { JwtPayload } from '../auth/interfaces';
import { PrismaService } from '../prisma/prisma.service';
import { add } from 'date-fns';
import { Category, User } from '@prisma/client';

@Injectable()
export class CategoryService {
  constructor(private readonly prismaService: PrismaService) {}
  /* save(dto: CreateCategoryDto, user: JwtPayload, images: Array<Express.Multer.File>) {
    return this.prismaService.category.create({
      data: {
        title: dto.title,
        images: this.setImageArray(images),
        description: dto.description,
        userId: user.id,
      },
    });
  }*/
  save(dto: CreateCategoryDto, user: JwtPayload) {
    return this.prismaService.category.create({
      data: {
        title: dto.title,
        images: dto.images,
        description: dto.description,
        brand: dto.brand,
        userId: user.id,
      },
    });
  }

  /*  private setImageArray(images: Array<Express.Multer.File>) {
    return images.length > 1
      ? images.map((img) => `http://localhost:8888/images/${img.filename}`)
      : [`http://localhost:8888/images/${images[0].filename}`];
  }*/

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

  async checkReceiptToExt(id: string) {
    if (add(new Date(), { months: 1 }) < new Date()) {
      const category: Category = await this.prismaService.category.update({
        where: {
          id: id,
        },
        data: {
          //@ts-ignore
          receipt: true,
        },
      });

      return category;
    }
  }
  async uploadImages(images: Array<Express.Multer.File>) {
    if (!images) {
      throw new NotFoundException();
    }

    return images;
  }
}
