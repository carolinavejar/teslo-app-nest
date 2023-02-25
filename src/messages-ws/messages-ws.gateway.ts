import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { NewMessageDTO } from './dtos/new-message.dto';
import { MessagesWsService } from './messages-ws.service';

@WebSocketGateway( { cors: true } )
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  
  @WebSocketServer() wss: Server;
  
  constructor(private readonly messagesWsService: MessagesWsService) {}
  handleConnection(client: Socket) {
    this.messagesWsService.registerClient(client)
    this.wss.emit(`clients-updated`, this.messagesWsService.getConnectedClients())
    
  }
  handleDisconnect(client: Socket) {
    this.messagesWsService.removeClient(client.id);
    this.wss.emit(`clients-updated`, this.messagesWsService.getConnectedClients())
  }

  @SubscribeMessage(`message-from-client`)
  handleMesageFromClient(client: Socket, payload: NewMessageDTO) {

    /* Emite unicamente al cliente
    client.emit(`message-from-server`, {
      fullName: `carito`,
      message: payload.message || `no message`
    }) */

    /* Emite a todos menos al cliente inicial 
    client.broadcast.emit(`message-from-server`, {
      fullName: `carito`,
      message: payload.message || `no message`
    }) */

    this.wss.emit(`message-from-server`, {
      fullName: `carito`,
      message: payload.message || `no message`
    })
    
  }


}
