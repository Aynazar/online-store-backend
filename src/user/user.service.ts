import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role, User } from '@prisma/client';
import { hashSync } from 'bcrypt';
import { JwtPayload } from '../auth/interfaces';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { convertToSecondsUtil } from '@common/utils';
import { ConfigService } from '@nestjs/config';
import { UserResponse } from './responses';

@Injectable()
export class UserService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  save(user: Partial<User>) {
    const hashedPassword = this.hashPassword(user.password);
    return this.prismaService.user.create({
      data: {
        email: user.email,
        password: hashedPassword,
        fullName: user.fullName,
        roles: ['USER'],
      },
    });
  }

  async getMe(id: string) {
    const user = await this.findOne(id);

    if (user.id === id) {
      const { password, ...data } = user;

      return data;
    }

    throw new ForbiddenException();
  }

  async findOne(idOrEmail: string, isReset = false) {
    if (isReset) {
      await this.cacheManager.del(idOrEmail);
    }
    const user = await this.cacheManager.get(idOrEmail);

    if (!user) {
      const user = await this.prismaService.user.findFirst({
        where: {
          OR: [{ id: idOrEmail }, { email: idOrEmail }],
        },
      });
      if (!user) {
        return null;
      }
      await this.cacheManager.set(idOrEmail, user, convertToSecondsUtil(this.configService.get('EXPIRES_IN')));

      return user;
    }

    return this.prismaService.user.findFirst({
      where: {
        OR: [{ id: idOrEmail }, { email: idOrEmail }],
      },
    });
  }

  async delete(id: string, user: JwtPayload) {
    if (user.id !== id && !user.roles.includes(Role.ADMIN)) {
      throw new ForbiddenException();
    }
    await Promise.all([this.cacheManager.del(id), this.cacheManager.del(user.email)]);
    return this.prismaService.user.delete({ where: { id }, select: { id: true } });
  }

  private hashPassword(password: string) {
    return hashSync(password, 10);
  }
}
