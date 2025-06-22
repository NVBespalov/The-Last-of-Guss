import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { User } from '@ThLOG/auth/entities';
import { AuthController } from './auth.controller';
import { AuthService, UsersService } from '@ThLOG/auth/services';
import { JwtStrategy, LocalStrategy } from '@ThLOG/auth/strategies';
import { JwtAuthGuard } from '@ThLOG/auth/guards';
import { RolesGuard } from '@ThLOG/auth/guards/roles.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'secret_key',
        signOptions: { expiresIn: '15m' },
      }),
    }),
    ConfigModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UsersService,
    LocalStrategy,
    JwtStrategy,
    RolesGuard,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  exports: [AuthService, UsersService, RolesGuard],
})
export class AuthModule {}
