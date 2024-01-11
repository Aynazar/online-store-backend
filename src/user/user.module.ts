import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { CacheModule } from '@nestjs/cache-manager';
import { UserController } from './user.controller';

@Module({
  exports: [UserService],
  controllers: [UserController],
  providers: [UserService],
  imports: [CacheModule.register()],
})
export class UserModule {}
