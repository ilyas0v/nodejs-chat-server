import { Message } from "../models/Message";
import * as fs from 'fs';
import { getCurrentTime } from "../tools/Time";

export const lastMessages: Message[] = [];

const MAX_MEMORY_MESSAGE = 1000;

/**
 * 
 * @param base64 - Base64 representation of the file (string)
 * @param folder - Destination folder where the file will be upload
 * @returns {string} - Full source path of the uploaded file
 */
export const storeImage = (base64: string, folder: string) => {
    var extension = base64.split(';')[0].split('/')[1];

    var filename = `${require('uuid').v4()}.${extension}`;

    fs.writeFile(`${folder}/${filename}`,
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

export const receiveMessage = (req: any, res: any, io: any) => {
    var message = req.body;
    let newMessage = new Message(message.sender, message.content, getCurrentTime(), (message.isImage || false), false);
    if (message.isImage) {
        let uploadedFilename = storeImage(message.content, './uploads');
        newMessage.content = uploadedFilename;
    }
    io.emit('message', newMessage);

    if (lastMessages.length === MAX_MEMORY_MESSAGE)
    {
        lastMessages.shift();
    }
    
    lastMessages.push(newMessage);

    res.json({ success: lastMessages });
}

export const getAllMessages = (req: any, res:any) => {
    res.json({ messages: lastMessages });
}

export const removeAllMessages = (req: any, res: any) => {
    lastMessages.splice(0, lastMessages.length);
    res.end('Messages deleted');
}