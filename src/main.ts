import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RedisIoAdapter } from './configs/redis.io.adapter';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Uncomment these lines to use the Redis adapter:
    const redisIoAdapter = app.get<RedisIoAdapter>(RedisIoAdapter);
    await redisIoAdapter.connectToRedis();
    app.useWebSocketAdapter(redisIoAdapter);

    await app.listen(3000);
}
bootstrap();
