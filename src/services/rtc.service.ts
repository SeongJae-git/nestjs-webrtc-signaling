import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { RTC_EXPIRE_TIME } from 'src/enums/rtc.expire.time.enum';
import { RTC_STATUS } from 'src/enums/rtc.status.enum';
import { RedisRepository } from 'src/redis/redis.repository';
import { RTCType } from 'src/types/socket.type';

@Injectable()
export class RTCService {
    constructor(private readonly redisRepository: RedisRepository) {}

    async joinRoom(client: Socket, room: string) {
        const existRoom: any = await this.redisRepository.get(room);

        if (existRoom?.room && existRoom.sender && existRoom.receiver) {
            return RTC_STATUS.FULL;
        }

        const rtcData: RTCType = existRoom?.room
            ? {
                  ...existRoom,
                  receiver: client.id
              }
            : {
                  room,
                  sender: client.id,
                  receiver: null,
                  createdAt: new Date()
              };

        await this.redisRepository.set(room, rtcData, RTC_EXPIRE_TIME.DAY);
        client.join(room);

        return rtcData.receiver ? RTC_STATUS.READY : RTC_STATUS.PENDING;
    }

    async getParticipants(room: string) {
        const { sender, receiver } = await this.redisRepository.get(room);
        const participants = { sender, receiver };

        return participants;
    }

    async deleteRoom(room: string) {
        this.redisRepository.del(room);
    }
}
