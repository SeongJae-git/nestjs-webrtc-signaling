import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RTC_STATUS } from 'src/enums/rtc.status.enum';
import { RTCService } from 'src/services/rtc.service';

@Injectable()
@WebSocketGateway(50080, { cors: true })
export class RTCGateway implements OnGatewayInit, OnGatewayDisconnect {
    private logger: Logger = new Logger(`EventGateway`);

    @WebSocketServer()
    socketServer: Server;

    constructor(private readonly rtcService: RTCService) {}

    afterInit(_server: any): void {
        this.logger.log(`EventGateway Initialize Complete!`);
    }

    handleDisconnect(client: Socket): void {
        // 해당 유저가 참가된 룸 인원수 조회 후 0명이면 방 제거 로직 필요
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('CTS-join')
    async handleJoinRoom(client: Socket, room: string): Promise<void> {
        const status: RTC_STATUS = await this.rtcService.joinRoom(client, room);

        switch (status) {
            case RTC_STATUS.PENDING: {
                client.emit('STC-pending');
                break;
            }
            case RTC_STATUS.READY: {
                console.log('준비완료');
                const users = await this.rtcService.getParticipants(room);
                console.log(users);

                this.socketServer.to(users.sender).emit('STC-offer', room);
                this.socketServer.to(users.receiver).emit('STC-pending');
            }
            // case RTC_STATUS.FULL:
            // case RTC_STATUS.REJECT
        }
    }

    @SubscribeMessage('CTS-offer')
    async callUser(client: Socket, data: any): Promise<void> {
        const users = await this.rtcService.getParticipants(data.room);

        this.socketServer.to(users.receiver).emit('STC-set-offer', {
            offer: data.offer,
            room: data.room
        });
    }

    @SubscribeMessage('CTS-answer')
    async makeAnswer(client: Socket, data: any): Promise<void> {
        const users = await this.rtcService.getParticipants(data.room);

        this.socketServer.to(users.sender).emit('STC-set-answer', data.answer);
    }

    @SubscribeMessage('reject')
    public rejectCall(client: Socket, data: any): void {
        client.to(data.from).emit('reject', {
            socket: client.id
        });
    }

    @SubscribeMessage('CTS-ice-candidate')
    public handleIceCandidate(client: Socket, data: { candidate: RTCIceCandidateInit; room: string }): void {
        this.socketServer.to(data.room).emit('STC-ice-candidate', {
            candidate: data.candidate,
            socket: client.id
        });
    }
}
