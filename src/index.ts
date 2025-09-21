import express from 'express';
import http from 'http';
import apiRouter from './api';
import wss from './services/messaging';
import { errorHandler } from './middleware/errorHandler';

const app = express();
// Use the port from the environment, which is automatically provided by the preview service.
const port = process.env.PORT;

app.use(express.json());
app.use('/api/v1', apiRouter);

// Error handling middleware
app.use(errorHandler);

const server = http.createServer(app);

server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, ws => {
    wss.emit('connection', ws, request);
  });
});

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
