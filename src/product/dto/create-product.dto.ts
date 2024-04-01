import { IsNumber, IsString, MaxLength } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MaxLength(255)
  title: string;

  @IsString()
  @MaxLength(357)
  description?: string;

  @IsNumber()
  price: number;

  @IsString()
  categoryId: string;

  type: string;
  brand: string;
  screen: string;
  screenSize: string;
  color: string;
  frame: string;

  images?: string[];
}
