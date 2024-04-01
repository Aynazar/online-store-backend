import { Controller, Get, Post, Body, Param, Delete, UseInterceptors, UploadedFile } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CurrentUser, Public } from '@common/decorators';
import { JwtPayload } from '../auth/interfaces';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileStorage } from '@common/utils/storage-images-multer';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get('all')
  @Public()
  getAll() {
    return this.categoryService.findAll();
  }

  @Post()
  createCategory(@Body() dto: CreateCategoryDto, @CurrentUser() user: JwtPayload) {
    return this.categoryService.save(dto, user);
  }

  @Post('upload-image')
  @UseInterceptors(FileInterceptor('image', { storage: fileStorage }))
  uploadImage(
    @UploadedFile()
    image: Express.Multer.File,
  ) {
    return this.categoryService.uploadImage(image);
  }

  @Get(':id')
  @Public()
  async findOneCategory(@Param('id') id: string) {
    return this.categoryService.findOne(id);
  }

  @Delete(':id')
  async deleteCategory(@Param('id') id: string) {
    return this.categoryService.delete(id);
  }
}
