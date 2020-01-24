import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: ':memory:',
      entities: [`${__dirname}/../**/*.entity{.ts,.js}`],
      synchronize: true,
    }),
  ],
})
export class DatabaseModule {}
