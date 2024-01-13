import {
  Controller,
  Get,
  Param,
  Delete,
  ClassSerializerInterceptor,
  UseInterceptors,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserResponse } from './responses';
import { CurrentUser, Roles } from '@common/decorators';
import { JwtPayload } from '../auth/interfaces';
import { RolesGuard } from '../auth/guards/Role.guard';
import { Role, User } from '@prisma/client';
import { Request } from 'express';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':idOrEmail')
  async findOneUser(@Param('idOrEmail') idOrEmail: string) {
    const user = await this.userService.findOne(idOrEmail);

    return new UserResponse(user);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Delete(':id')
  async deleteUser(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.userService.delete(id, user);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.USER)
  @Get('account/me')
  me(@CurrentUser() user: User) {
    return this.userService.getMe(user.id);
  }
}
