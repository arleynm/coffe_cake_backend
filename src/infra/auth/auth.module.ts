import { Module } from '@nestjs/common';
import { PrismaModule } from '../db/prisma.module';
import { PrismaUserRepository } from '../repos/auth/prisma-user.repository';
import { PrismaRefreshTokenRepository } from '../repos/auth/prisma-refresh-token.repository';
import { Argon2PasswordHasher } from '../crypto/password-hasher';
import { TokensService } from './tokens.service';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from '../http/controllers/auth.controller';

@Module({
  imports: [PrismaModule],
  providers: [
    PrismaUserRepository,
    PrismaRefreshTokenRepository,
    Argon2PasswordHasher,
    TokensService,
    JwtStrategy,
  ],
  controllers: [AuthController],
  exports: [PrismaUserRepository],
})
export class AuthModule {}
