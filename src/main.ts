import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { EnvConfigService } from './config/env-config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(EnvConfigService);
  const nodeEnv = configService.node.env;

  const port = process.env.DEBUG_PORT
    ? parseInt(process.env.DEBUG_PORT, 10)
    : configService.node.port;

  await app.listen(port);

  Logger.log(
    `🚀 Server is running on port ${port} in ${nodeEnv} mode`,
    'Bootstrap',
  );
}
bootstrap();
