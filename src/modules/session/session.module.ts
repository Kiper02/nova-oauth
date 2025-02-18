import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { SessionController } from './session.controller';
import { RedisModule } from 'src/core/redis/redis.module';

@Module({
  controllers: [SessionController],
  providers: [SessionService],
  imports: [RedisModule]
})
export class SessionModule {}
