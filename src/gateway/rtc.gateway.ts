import { Injectable, Logger } from '@nestjs/common';
import { OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RTC_STATUS } from 'src/enums/rtc.status.enum';
import { RTCService } from 'src/services/rtc.service';
import { CheckUtil } from 'src/utils/check.util';

@Injectable()
@WebSocketGateway(57012, {
    cors: {
        origin: [
            'http://webrtc.osj-nas.synology.me',
            'https://webrtc.osj-nas.synology.me',
            'http://signal.osj-nas.synology.me',
            'https://signal.osj-nas.synology.me'
        ]
    }
})
export class RTCGateway implements OnGatewayInit {
    private logger: Logger = new Logger(`RTCGateway`);

    @WebSocketServer()
    socketServer: Server;

    constructor(private readonly rtcService: RTCService) {}

    /**
     * implements required methods...
     */
    afterInit(_server: any): void {
        this.logger.log(`EventGateway Initialize Complete!`);
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
                const users = await this.rtcService.getParticipants(room);

                this.socketServer.to(users.sender).emit('STC-offer', room);
                this.socketServer.to(users.receiver).emit('STC-pending');
                break;
            }
            case RTC_STATUS.FULL: {
                client.emit('STC-full');
                break;
            }
        }
    }

    @SubscribeMessage('CTS-leave')
    async handleLeaveRoom(client: Socket, room: string) {
        client.leave(room);

        const users = await this.socketServer.in(room).fetchSockets();

        if (CheckUtil.isEmpty(users)) {
            await this.rtcService.deleteRoom(room);
        } else {
            users.forEach((socket) => {
                if (socket.id !== client.id) {
                    socket.emit('STC-leave');
                }
            });
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

    @SubscribeMessage('CTS-ice-candidate')
    public handleIceCandidate(client: Socket, data: { candidate: RTCIceCandidateInit; room: string }): void {
        this.socketServer.to(data.room).emit('STC-ice-candidate', {
            candidate: data.candidate,
            socket: client.id
        });
    }
}
