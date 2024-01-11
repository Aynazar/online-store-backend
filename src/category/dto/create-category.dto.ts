import { IsString, MinLength } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @MinLength(6)
  title: string;

  @IsString()
  @MinLength(6)
  description: string;

  images: string[];
}
