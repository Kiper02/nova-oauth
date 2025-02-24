import { NestFactory } from '@nestjs/core';
import { AppModule } from './core/core.module';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import { RedisStore } from 'connect-redis';
import { ValidationPipe } from '@nestjs/common';
import { IS_DEV } from './shared/utils/is-dev.uil';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {cors: {origin: "*"}});
  
  const config = app.get(ConfigService);
  const redis = new Redis(config.getOrThrow<string>('REDIS_URL'));

  app.useGlobalPipes(new ValidationPipe())
  app.use(cookieParser(config.getOrThrow<string>("COOKIE_SECRET")))

  app.use(session({
    name: config.getOrThrow<string>('SESSION_NAME'),
    secret: config.getOrThrow<string>('SESSION_SECRET'),
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: IS_DEV ? false : true,
      httpOnly: IS_DEV ? false : true,
    },
    store: new RedisStore({
      prefix: config.getOrThrow<string>('SESSION_FOLDER'),
      client: redis
    })
  }))
  
  await app.listen(config.getOrThrow<string>('PORT'));
}
bootstrap();
