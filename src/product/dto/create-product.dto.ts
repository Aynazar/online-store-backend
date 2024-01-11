import { IsNumber, IsString, MaxLength } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MaxLength(255)
  title: string;

  @IsString()
  @MaxLength(357)
  description: string;

  @IsNumber()
  price: number;

  @IsString()
  categoryId: string;

  images?: string[];
}
