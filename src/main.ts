import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RedisIoAdapter } from './redis/redis.io.adapter';
import { HTTPS_OPTIONS } from 'certificates/certificates.config';

async function bootstrap() {
    const httpsOptions = HTTPS_OPTIONS;

    const app = await NestFactory.create(AppModule, { httpsOptions });
    const redisIoAdapter = app.get<RedisIoAdapter>(RedisIoAdapter);
    await redisIoAdapter.connectToRedis();

    app.enableCors({ origin: '*' });

    app.useWebSocketAdapter(redisIoAdapter);

    await app.listen(process.env.HTTP_LISTENING_PORT);
}
bootstrap();
