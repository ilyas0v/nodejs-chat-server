import * as express from "express";
import * as path from "path";
import * as moment from 'moment';
import { Message } from "./models/Message";

const app = express();

var cors = require('cors')

app.use(cors())

app.set("port", process.env.PORT || 3000);

let http = require("http").Server(app);

const io = require('socket.io')(http, {
    cors: {
        origin: '*',
    }
});

app.get("/", (req: any, res: any) => {
    return 'Chat API';
});


var userCount = 0;
var lastMessages = [];

io.on("connection", (socket: any) => {

    socket.on('disconnect', () => {
        io.emit('user_count', --userCount);
    });

    socket.on("message",  (message: any) => {
        io.emit('message', (new Message(message.sender, message.content, getCurrentTime(), (message.isImage || false), false)));
    });

    socket.on('user_join', (nickname: any) => {
        io.emit('message', (new Message('System', `'${nickname}' has joined the room`, getCurrentTime(), false, true)));
    });
    
    io.emit('user_count', ++userCount);
});



function getCurrentTime() : string
{
    return (moment(new Date())).format('HH:mm')
}

const server = http.listen(3000, () => {
    console.log("listening on *:3000");
});