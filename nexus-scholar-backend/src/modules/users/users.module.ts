import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AiModule } from '../ai/ai.module';
import { AuthModule } from '../auth/auth.module';

// AuthModule is imported to get access to JwtAuthGuard for protecting routes.
// No circular dependency: AuthModule does NOT import UsersModule.
@Module({
  imports: [AiModule, AuthModule],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
