import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProductService } from './product.service';
import { CurrentUser } from '@common/decorators';
import { User } from '@prisma/client';
import { CreateProductDto } from './dto/create-product.dto';

@Controller('product')
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
