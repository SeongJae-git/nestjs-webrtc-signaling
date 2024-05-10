import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RedisIoAdapter } from './redis/redis.io.adapter';
import { HTTPS_OPTIONS } from 'certificates/_certificates.config';
import { Logger } from '@nestjs/common';

async function bootstrap() {
    const port = process.env.PORT;
    const httpsOptions = HTTPS_OPTIONS;

    const app = await NestFactory.create(AppModule, { httpsOptions });
    const redisIoAdapter = app.get<RedisIoAdapter>(RedisIoAdapter);
    await redisIoAdapter.connectToRedis();

    app.enableCors({ origin: '*' });

    app.useWebSocketAdapter(redisIoAdapter);

    await app.listen(port);

    new Logger('Main').log(`Server running on port ${port}`);
}
bootstrap();
