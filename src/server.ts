import * as express from "express";
import { Server } from 'http';
import * as socketIo from 'socket.io';
import { receiveMessage, getAllMessages, removeAllMessages } from "./controllers/MessageController";
import { onConnect, onDisconnect, onJoin, onStopTyping, onTyping } from './controllers/UserController';

const app = express();

app.use( express.json({ limit: '50mb' }) );
app.use( '/uploads', express.static('uploads') );

const http = new Server(app);

const io = socketIo(http, {
    cors: {
        origin: '*'
    }
});

/**
 * WEBSOCKET OPERATIONS
 */
io.on("connection", (socket: any) => 
{
    onConnect(io);
    socket.on('disconnect',  () => { onDisconnect(io) });
    socket.on('user_join',   (nickname: any) => { onJoin(io, nickname )});
    socket.on('typing',      (nickname: string) => { onTyping(io, nickname) });
    socket.on('stop_typing', (nickname: string) => { onStopTyping(io, nickname) });
});

/**
 * API ENDPOINTS
 */
app.post('/send-message', (req: any, res: any) => { receiveMessage(req, res, io); });
app.get('/messages', (req: any, res: any) => { getAllMessages(req, res); });
app.get('/remove-messages', (req: any, res: any) => { removeAllMessages(req, res); });

const server = http.listen(3000, () => {
    console.log("listening on *:3000");
});