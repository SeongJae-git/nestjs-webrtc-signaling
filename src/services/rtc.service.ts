import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { RTC_STATUS } from 'src/enums/rtc.status.enum';
import { RedisRepository } from 'src/redis/redis.repository';
import { RTCType } from 'src/types/socket.type';

@Injectable()
export class RTCService {
    constructor(private readonly redisRepository: RedisRepository) {}

    async joinRoom(client: Socket, room: string) {
        const existRoom: any = await this.redisRepository.get(room);

        if (existRoom.room) {
            const rtcData: RTCType = {
                ...existRoom,
                receiver: client.id
            };

            await this.redisRepository.set(room, rtcData);

            client.join(room);

            return RTC_STATUS.READY;
        } else {
            const rtcData: RTCType = {
                room,
                sender: client.id,
                receiver: null,
                createdAt: new Date()
            };

            await this.redisRepository.set(room, rtcData);

            client.join(room);

            return RTC_STATUS.PENDING;
        }
    }

    async getParticipants(room: string) {
        const { sender, receiver } = await this.redisRepository.get(room);
        const participants = { sender, receiver };

        return participants;
    }
}
