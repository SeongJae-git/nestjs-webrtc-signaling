import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisIoAdapter } from './configs/redis.io.adapter';
@Module({
    imports: [ConfigModule.forRoot()],
    controllers: [],
    providers: [RedisIoAdapter]
})
export class AppModule {}
