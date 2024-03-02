import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  ForbiddenException,
  Get,
  HttpStatus,
  Post,
  Res,
  UnauthorizedException,
  UseInterceptors,
} from '@nestjs/common';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { AuthService } from './auth.service';
import { Tokens } from './interfaces';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { Cookie, Public, UserAgent } from '@common/decorators';
import { UserResponse } from '../user/responses';
import { UserService } from '../user/user.service';
import { User } from '@prisma/client';

const REFRESH_TOKEN = 'refreshtoken';

@Public()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  @Get('all')
  getAll() {
    return this.authService.findAll();
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Post('register')
  async register(@Body() dto: RegisterAuthDto) {
    const user = await this.authService.register(dto);

    if (!user) {
      throw new BadRequestException(`Не получилось зарегистрировать пользователя с данными ${JSON.stringify(user)}`);
    }

    return new UserResponse(user);
  }
  @Post('login')
  async login(@Body() dto: LoginAuthDto, @Res() res: Response, @UserAgent() agent: string) {
    const tokens = await this.authService.login(dto, agent);
    const userData = await this.userService.findOne(dto.email);

    if (!userData) {
      throw new ForbiddenException();
    }

    if (!tokens) {
      throw new BadRequestException('Не получается войти');
    }

    this.setRefreshTokenToCookies(tokens, res, userData);

    return { accessToken: tokens.accessToken };
  }
  @Get('logout')
  async logout(@Cookie(REFRESH_TOKEN) refreshToken: string, @Res() res: Response) {
    if (!refreshToken) {
      res.sendStatus(HttpStatus.OK);
      return;
    }

    await this.authService.deleteRefreshToken(refreshToken);
    res.cookie(REFRESH_TOKEN, '', { httpOnly: true, secure: true, expires: new Date() });
    res.sendStatus(HttpStatus.OK);
  }
  @Get('refresh-tokens')
  async refreshTokens(@Cookie(REFRESH_TOKEN) refreshToken: string, @Res() res: Response, @UserAgent() agent: string) {
    if (!refreshToken) {
      throw new UnauthorizedException();
    }

    const tokens = await this.authService.refreshTokens(refreshToken, agent);

    if (!tokens) {
      throw new UnauthorizedException();
    }

    this.setRefreshTokenToCookies(tokens, res, null);
  }

  private setRefreshTokenToCookies(tokens: Tokens, res: Response, user: User) {
    const { password, ...userData } = user;
    if (!tokens && !userData) {
      throw new UnauthorizedException();
    }

    res.cookie(REFRESH_TOKEN, tokens.refreshToken.token, {
      httpOnly: true,
      sameSite: 'lax',
      expires: new Date(tokens.refreshToken.exp),
      secure: this.configService.get('NODE_ENV', 'development') === 'production',
      path: '/',
    });
    res.status(HttpStatus.CREATED).json({ ...userData, accessToken: tokens.accessToken });
  }
}
