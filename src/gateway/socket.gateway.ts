import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    WebSocketGateway,
    WebSocketServer
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ namespace: 'test' })
export class SocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    afterInit(server: any) {
        console.log('서버 초기화 완료');
    }

    handleConnection(client: any, ...args: any[]) {
        console.log('소켓 연결 완료');
    }

    handleDisconnect(client: any) {
        console.log('소켓 연결 해제됨');
    }
}
