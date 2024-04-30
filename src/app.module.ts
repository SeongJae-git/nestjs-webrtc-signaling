import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisIoAdapter } from './configs/redis.io.adapter';
@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            cache: true,
            envFilePath: [`.env`]
        })
    ],
    controllers: [],
    providers: [RedisIoAdapter]
})
export class AppModule {}
