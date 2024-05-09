import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Redis } from 'ioredis';
import { RTCType } from 'src/types/socket.type';

export class RedisRepository {
    constructor(@InjectRedis() private readonly redis: Redis) {}

    async get(room: string) {
        return this.redis.hgetall(room);
    }

    async set(room: string, data: RTCType, expire: number) {
        await this.redis.hset(room, data);

        this.redis.expire(room, expire);
    }

    async del(room: string) {
        this.redis.del(room);
    }
}
