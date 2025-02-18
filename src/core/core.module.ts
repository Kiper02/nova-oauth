import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { SessionModule } from 'src/modules/session/session.module';
import { ApplicationModule } from 'src/modules/application/application.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env'
    }),
    PrismaModule,
    RedisModule,
    SessionModule,
    ApplicationModule,
  ],
})
export class AppModule {}
