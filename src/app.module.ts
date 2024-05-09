import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisIoAdapter } from './redis/redis.io.adapter';
import { RTCGateway } from './gateway/rtc.gateway';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { RedisRepository } from './redis/redis.repository';
import { RTCService } from './services/rtc.service';
import { TestController } from './test.controller';
@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            cache: true,
            envFilePath: [`.env`]
        }),
        RedisModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                readyLog: true,
                config: {
                    host: configService.get('REDIS_HOST'),
                    port: configService.get('REDIS_PORT'),
                    password: configService.get('REDIS_PASSWORD')
                }
            })
        })
    ],
    controllers: [TestController],
    providers: [RedisIoAdapter, RedisRepository, RTCGateway, RTCService]
})
export class AppModule {}
