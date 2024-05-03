import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Redis } from 'ioredis';
import { RTCType } from 'src/types/socket.type';

export class RedisRepository {
    constructor(@InjectRedis() private readonly redis: Redis) {}

    async get(room: string) {
        return this.redis.hgetall(room);
    }

    async set(room: string, data: RTCType) {
        return this.redis.hset(room, data);
    }

    async del(room: string) {
        return this.redis.del(room);
    }
}
