import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import * as process from 'node:process';

export class CustomIoAdapter extends IoAdapter {
  createIOServer(port: number, options?: ServerOptions): any {
    const wsport = Number(process.env.WSPORT) || 3001;
    console.log(
      `🚀 WebSocket сервер запускается на отдельном порту: ${wsport}`,
    );
    const server = super.createIOServer(wsport, options);

    server.on('connection', (socket: any) => {
      console.log(`WebSocket клиент подключен: ${socket.id}`);
    });

    return server;
  }
}
