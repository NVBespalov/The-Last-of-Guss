import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.configService.getOrThrow<string>('database.host'),
      port: this.configService.getOrThrow<number>('database.port'),
      username: this.configService.getOrThrow<string>('database.username'),
      password: this.configService.getOrThrow<string>('database.password'),
      database: this.configService.getOrThrow<string>('database.database'),
      schema: this.configService.getOrThrow<string>('database.schema'),
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: this.configService.getOrThrow<boolean>(
        'database.synchronize',
      ),
      logging: this.configService.getOrThrow<boolean>('database.logging'),
    };
  }
}
