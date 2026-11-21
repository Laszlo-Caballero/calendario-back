import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

interface JoinRoomPayload {
  todosId: number;
  user: {
    userId?: number;
    name: string;
    email?: string;
  };
}

interface DocSyncPayload {
  todosId: number;
  content: string;
  editor: {
    userId?: number;
    name: string;
    activeBlockId?: string;
  };
}

interface CursorMovePayload {
  todosId: number;
  activeBlockId: string | null;
  editor: {
    userId?: number;
    name: string;
  };
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'board-doc',
})
export class BoardDocGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly userRooms = new Map<
    string,
    { todosId: number; user: JoinRoomPayload['user'] }
  >();

  handleConnection(client: Socket) {}

  handleDisconnect(client: Socket) {
    const session = this.userRooms.get(client.id);
    if (session) {
      this.userRooms.delete(client.id);
      client.to(`board:${session.todosId}`).emit('user:left', {
        socketId: client.id,
        user: session.user,
      });
    }
  }

  @SubscribeMessage('join:board')
  handleJoinBoard(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinRoomPayload,
  ) {
    const roomName = `board:${payload.todosId}`;
    client.join(roomName);
    this.userRooms.set(client.id, {
      todosId: payload.todosId,
      user: payload.user,
    });

    client.to(roomName).emit('user:joined', {
      socketId: client.id,
      user: payload.user,
    });
  }

  @SubscribeMessage('leave:board')
  handleLeaveBoard(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { todosId: number },
  ) {
    const roomName = `board:${payload.todosId}`;
    client.leave(roomName);
    const session = this.userRooms.get(client.id);
    this.userRooms.delete(client.id);
    if (session) {
      client.to(roomName).emit('user:left', {
        socketId: client.id,
        user: session.user,
      });
    }
  }

  @SubscribeMessage('board:doc-change')
  handleDocChange(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: DocSyncPayload,
  ) {
    client.to(`board:${payload.todosId}`).emit('board:doc-updated', {
      content: payload.content,
      editor: payload.editor,
      timestamp: Date.now(),
    });
  }

  @SubscribeMessage('board:cursor')
  handleCursorMove(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: CursorMovePayload,
  ) {
    client.to(`board:${payload.todosId}`).emit('board:cursor-moved', {
      activeBlockId: payload.activeBlockId,
      editor: payload.editor,
    });
  }
}
