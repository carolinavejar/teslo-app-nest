import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { MessagesWsService } from './messages-ws.service';

@WebSocketGateway( { cors: true } )
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly messagesWsService: MessagesWsService) {}
  handleConnection(client: Socket) {
    this.messagesWsService.registerClient(client)
    console.log({'conectados': 
    this.messagesWsService.getConnectedClients()});
    
  }
  handleDisconnect(client: Socket) {
    this.messagesWsService.removeClient(client.id)
  }
}
