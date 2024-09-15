import { JwtModule} from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from '../../shared/strategies/jwt.strategy';
import { LocalStrategy } from '../../shared/strategies/local.strategy';
import { UsersModule } from '../users/users.module';

@Module({
  providers: [
    AuthService, 
    LocalStrategy, 
    JwtStrategy
  ],
  controllers: [
    AuthController
  ],
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '3d'},
    }),
    PassportModule,
    UsersModule,
  ],
})
export class AuthModule {}
