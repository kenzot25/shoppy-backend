import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Setup logger
  app.useLogger(app.get(Logger));
  // this setup ensures that incoming data is validated, and any unexpected properties are removed before passing the data to your route handlers.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, //strips out any properties from the request body that are not explicitly defined in your DTO
    }),
  );
  // Use for parse cookie
  app.use(cookieParser());
  await app.listen(app.get(ConfigService).getOrThrow('PORT'));
}
bootstrap();
