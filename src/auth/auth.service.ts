import { ConflictException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { UserService } from '../user/user.service';
import { LoginAuthDto } from './dto/login-auth.dto';
import { Tokens } from './interfaces';
import { compareSync } from 'bcrypt';
import { Token, User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { v4 } from 'uuid';
import { add } from 'date-fns';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
  ) {}

  async register(dto: RegisterAuthDto) {
    const user: User = await this.userService.findOne(dto.email).catch((err) => {
      this.logger.error(err);
      return null;
    });

    if (user) {
      throw new ConflictException('Пользователь с таким e-mail уже зарегистрирован');
    }

    return this.userService.save(dto).catch((err) => {
      this.logger.error(err);
      return null;
    });
  }

  async login(dto: LoginAuthDto, agent: string): Promise<Tokens> {
    const user: User = await this.userService.findOne(dto.email, true).catch((err) => {
      this.logger.error(err);
      return null;
    });

    if (!user || !compareSync(dto.password, user.password)) {
      throw new UnauthorizedException('Неверный логин или пароль');
    }

    return this.generateTokens(user, agent);
  }

  async refreshTokens(refreshToken: string, agent: string): Promise<Tokens> {
    const token = await this.prismaService.token.findUnique({ where: { token: refreshToken } });

    if (!token) {
      throw new UnauthorizedException();
    }

    await this.prismaService.token.delete({ where: { token: refreshToken } });
    if (new Date(token.exp) < new Date()) {
      throw new UnauthorizedException();
    }
    const user = await this.userService.findOne(token.userId);

    return this.generateTokens(user, agent);
  }

  deleteRefreshToken(token: string) {
    return this.prismaService.token.delete({ where: { token } });
  }

  private async generateTokens(user: User, agent: string): Promise<Tokens> {
    const accessToken = this.jwtService.sign({
      id: user.id,
      email: user.email,
      roles: user.roles,
    });

    const refreshToken = await this.getRefreshToken(user.id, agent);

    return { accessToken, refreshToken };
  }

  findAll() {
    return this.prismaService.user.findMany();
  }

  private async getRefreshToken(userId: string, agent: string): Promise<Token> {
    const _token = await this.prismaService.token.findFirst({ where: { userId, userAgent: agent } });

    const token = _token?.token ?? '';

    return this.prismaService.token.upsert({
      where: { token },
      update: { token: v4(), exp: add(new Date(), { months: 1 }) },
      create: {
        token: v4(),
        exp: add(new Date(), { months: 1 }),
        userId,
        userAgent: agent,
      },
    });
  }
}
