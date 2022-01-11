import * as express from "express";
import * as moment from 'moment';
import { Message } from "./models/Message";

const app = express();

var cors = require('cors')

var bodyParser = require('body-parser');

app.use(cors())
app.use(bodyParser({ limit: '50mb' }))
app.use('/uploads', express.static('uploads'));
app.set("port", process.env.PORT || 3000);

let http = require("http").Server(app);

const io = require('socket.io')(http, {
    cors: {
        origin: '*',
    }
});

const fs = require("fs");

var userCount = 0;
var lastMessages: any[] = [];
var typingUsers: string[] = [];

io.on("connection", (socket: any) => 
{
    socket.on('disconnect', () => {
        io.emit('user_count', --userCount);
    });

    socket.on("message",  (message: any) => {
        let newMessage = new Message(message.sender, message.content, getCurrentTime(), (message.isImage || false), false);
        if(message.isImage)
        {
            let uploadedFilename = storeImage(message.content);
            newMessage.content = uploadedFilename;
        }
        io.emit('message', newMessage);
        lastMessages.push(newMessage);
    });

    socket.on('user_join', (nickname: any) => {
        var newMessage = new Message('System', `'${nickname}' has joined the room`, getCurrentTime(), false, true);
        io.emit('message', newMessage);
        lastMessages.push(newMessage);
    });

    socket.on('typing', (nickname: string) => {
        var index = typingUsers.indexOf(nickname);
        if(index === -1)
        {
            typingUsers.push(nickname);
        }
        io.emit('typing', formatTypingUsers());
    });

    socket.on('stop_typing', (nickname: string) => {
        var index = typingUsers.indexOf(nickname);
        typingUsers.splice(index, 1);
        io.emit('typing', formatTypingUsers());
    });
    
    io.emit('user_count', ++userCount);
});

app.post('/send-message', (req: any, res: any) => {
    var message = req.body;
    let newMessage = new Message(message.sender, message.content, getCurrentTime(), (message.isImage || false), false);
    if (message.isImage) {
        let uploadedFilename = storeImage(message.content);
        newMessage.content = uploadedFilename;
    }
    io.emit('message', newMessage);
    lastMessages.push(newMessage);

    res.json({success: true});
});

app.get('/messages', (req: any, res: any) => {
    res.json({ messages: lastMessages });
});

app.get('/remove-messages', (req: any, res: any) => {
    lastMessages.splice(0, lastMessages.length);
    res.end('Messages deleted');
});

const getCurrentTime = () =>
{
    return (moment(new Date())).format('HH:mm')
}

const formatTypingUsers = () => 
{
    if(typingUsers.length === 0)
    {
        return '';
    }
    
    return `${typingUsers.join(", ")} ${ typingUsers.length > 1 ? 'are' : 'is' } typing...`;
}

const storeImage = (base64: string) => 
{
    var extension = base64.split(';')[0].split('/')[1];

    var filename = `${require('uuid').v4()}.${extension}`;

    fs.writeFile(`./uploads/${ filename }`, 
                 base64.replace(/^data:image\/png;base64,/, '')
                        .replace(/^data:image\/jpeg;base64,/, '')
                        .replace(/^data:image\/gif;base64,/, '')
                        .replace(/^data:image\/jpg;base64,/, ''),
                 'base64', 
                 function (err: any) {
                    console.log(err);
                 }
    );

    return `http://localhost:3000/uploads/${filename}`;
}

const server = http.listen(3000, () => {
    console.log("listening on *:3000");
});