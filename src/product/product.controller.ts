import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ProductService } from './product.service';
import { CurrentUser, Roles } from '@common/decorators';
import { Role, User } from '@prisma/client';
import { CreateProductDto } from './dto/create-product.dto';
import { RolesGuard } from '../auth/guards/Role.guard';

@Controller('product')
@UseGuards(RolesGuard)
@Roles(Role.ADMIN)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  createProduct(@Body() dto: CreateProductDto, @CurrentUser() user: User) {
    return this.productService.save(dto, user);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.productService.findOne(id);
  }
}
