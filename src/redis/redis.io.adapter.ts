import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server, ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HTTPS_OPTIONS } from 'certificates/_certificates.config';
import * as https from 'https';

@Injectable()
export class RedisIoAdapter extends IoAdapter {
    private adapterConstructor: ReturnType<typeof createAdapter>;

    private HOST: string;
    private PORT: string;
    private PASSWORD: string;

    constructor(private readonly configService: ConfigService) {
        super();

        this.HOST = this.configService.get<string>('REDIS_HOST');
        this.PORT = this.configService.get<string>('REDIS_PORT');
        this.PASSWORD = this.configService.get<string>('REDIS_PASSWORD');
    }

    async connectToRedis(): Promise<void> {
        const redisURL = `redis://:${this.PASSWORD}@${this.HOST}:${this.PORT}`;
        const pubClient = createClient({ url: redisURL });
        const subClient = pubClient.duplicate();

        await Promise.all([pubClient.connect(), subClient.connect()]);

        this.adapterConstructor = createAdapter(pubClient, subClient);
    }

    createIOServer(port: number, options?: ServerOptions): Server {
        const httpsOptions = HTTPS_OPTIONS;

        const server = https.createServer(httpsOptions);

        const io = new Server(server, options);

        io.adapter(this.adapterConstructor);

        server.listen(port);

        return io;
    }
}
