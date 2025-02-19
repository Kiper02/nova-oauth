import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { SessionModule } from 'src/modules/session/session.module';
import { ApplicationModule } from 'src/modules/application/application.module';
import { AuthModule } from 'src/modules/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { UserInfoModule } from 'src/modules/user-info/user-info.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env'
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET
    }),
    PrismaModule,
    RedisModule,
    SessionModule,
    ApplicationModule,
    AuthModule,
    UserInfoModule,
  ],
})
export class AppModule {}
