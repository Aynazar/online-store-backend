import { Controller, Get, Post, Body, Param, UseGuards, Delete } from '@nestjs/common';
import { ProductService } from './product.service';
import { CurrentUser, Public, Roles } from '@common/decorators';
import { Role } from '@prisma/client';
import { CreateProductDto } from './dto/create-product.dto';
import { RolesGuard } from '../auth/guards/Role.guard';
import { JwtPayload } from '../auth/interfaces';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Public()
  @Get('all')
  async getAll() {
    return this.productService.findAll();
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  createProduct(@Body() dto: CreateProductDto, @CurrentUser() user: JwtPayload) {
    return this.productService.save(dto, user);
  }

  @Public()
  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async deleteProduct(@Param('id') id: string) {
    return this.productService.delete(id);
  }
}
