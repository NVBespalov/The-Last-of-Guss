import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';

export class CustomIoAdapter extends IoAdapter {
  createIOServer(port: number, options?: ServerOptions): any {
    const wsport = 3000;
    console.log(
      `🚀 WebSocket сервер запускается на отдельном порту: ${wsport}`,
    );
    const server = super.createIOServer(wsport, options);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    server.on('connection', (socket: any) => {
      console.log(`WebSocket клиент подключен: ${socket.id}`);
    });

    return server;
  }
}
