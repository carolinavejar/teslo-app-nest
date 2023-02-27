import { JwtService } from '@nestjs/jwt';
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { JWTPayload } from '../auth/interfaces';
import { NewMessageDTO } from './dtos/new-message.dto';
import { MessagesWsService } from './messages-ws.service';

@WebSocketGateway( { cors: true } )
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  
  @WebSocketServer() wss: Server;
  
  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly jwtService: JwtService
  ) {}


  async handleConnection(client: Socket) {
    const token = client.handshake.headers.authentication as string;
    let payload : JWTPayload;

    try {
      payload = this.jwtService.verify( token );
      await this.messagesWsService.registerClient(client, payload.id);
    } catch (error) {
      client.disconnect();
    }
    
    // console.log({ payload });
    
    this.wss.emit(`clients-updated`, this.messagesWsService.getConnectedClients())
    
  }


  handleDisconnect(client: Socket) {   
    this.messagesWsService.removeClient(client.id);
    this.wss.emit(`clients-updated`, this.messagesWsService.getConnectedClients())
  }


  @SubscribeMessage(`message-from-client`)
  handleMesageFromClient(client: Socket, payload: NewMessageDTO) {
    this.wss.emit(`message-from-server`, {
      fullName: this.messagesWsService.getUserFullName(client.id),
      message: payload.message || `no message`
    })
    
  }


}
