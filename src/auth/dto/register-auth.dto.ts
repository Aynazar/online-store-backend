import { IsEmail, IsString, MinLength, Validate } from 'class-validator';
import { IsPasswordsMatchingConstraint } from '@common/decorators';

export class RegisterAuthDto {
  @IsEmail()
  email: string;

  @IsString()
  fullName: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @MinLength(6)
  @Validate(IsPasswordsMatchingConstraint)
  passwordRepeat: string;
}
