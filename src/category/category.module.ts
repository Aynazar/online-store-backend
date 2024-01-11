import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  controllers: [CategoryController],
  providers: [CategoryService],
  imports: [CacheModule.register()],
})
export class CategoryModule {}
