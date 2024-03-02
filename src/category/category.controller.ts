import { Controller, Get, Post, Body, Param, Delete, UseGuards, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CurrentUser, Public, Roles } from '@common/decorators';
import { JwtPayload } from '../auth/interfaces';
import { RolesGuard } from '../auth/guards/Role.guard';
import { Role } from '@prisma/client';
import { FileFieldsInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
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
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  createCategory(@Body() dto: CreateCategoryDto, @CurrentUser() user: JwtPayload) {
    return this.categoryService.save(dto, user);
  }

  @Post('upload-images')
  @UseInterceptors(FilesInterceptor('images', 10, { storage: fileStorage }))
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  uploadImages(
    @UploadedFiles()
    images: Array<Express.Multer.File>,
  ) {
    return this.categoryService.uploadImages(images);
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
