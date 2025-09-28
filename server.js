import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server } from 'socket.io';

const dev = process.env.NODE_ENV !== 'production';
const hostname = dev ? 'localhost' : '0.0.0.0';
const port = process.env.PORT || 3001;

const app = next({ dev, hostname: dev ? hostname : undefined, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  const io = new Server(httpServer, {
    cors: {
      origin: dev ? ["http://localhost:3000", "http://localhost:3001"] : "*",
      methods: ["GET", "POST"],
      credentials: false
    },
    allowEIO3: true,
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });

    // Handle vote updates
    socket.on('vote-update', (data) => {
      console.log('Broadcasting vote update:', data);
      socket.broadcast.emit('vote-updated', data);
    });

    // Handle new prediction creation
  socket.on('prediction-created', (data) => {
    console.log('Broadcasting new prediction:', data);
    socket.broadcast.emit('prediction-added', data);
  });
  });

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://0.0.0.0:${port}`);
      console.log(`> Environment: ${process.env.NODE_ENV}`);
      console.log(`> Socket.IO server initialized`);
    });
});