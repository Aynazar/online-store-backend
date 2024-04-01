import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { JwtPayload } from '../auth/interfaces';
import { PrismaService } from '../prisma/prisma.service';
import { add } from 'date-fns';
import { Category, Role } from '@prisma/client';

@Injectable()
export class CategoryService {
  constructor(private readonly prismaService: PrismaService) {}
  save(dto: CreateCategoryDto, user: JwtPayload) {
    if (!user.roles.includes(Role.ADMIN)) {
      throw new ForbiddenException();
    }
    return this.prismaService.category.create({
      data: {
        title: dto.title,
        image: dto.image,
        description: dto.description,
        brand: dto.brand,
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

  async checkReceiptToExt(id: string) {
    if (add(new Date(), { months: 1 }) < new Date()) {
      const category: Category = await this.prismaService.category.update({
        where: {
          id: id,
        },
        data: {
          receipt: true,
        },
      });

      return category;
    }
  }
  async uploadImage(file: Express.Multer.File) {
    console.log(file);
    return {
      url: `http://localhost:8888/images/${file.filename}`,
      size: file.size,
      filename: file.filename,
    };
  }
}
