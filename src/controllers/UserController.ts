import { getCurrentTime } from "../tools/Time";
import { Message } from "../models/Message";
import { lastMessages } from "./MessageController";

export var activeUserCount: number = 0;
export var typingUsers: string[] = [];

export const onConnect = (io: any) => {
    io.emit('user_count', ++activeUserCount);
}

export const onDisconnect = (io: any) => {
    io.emit('user_count', --activeUserCount);
}

export const onJoin = (io: any, nickname: string) => {
    var newMessage = new Message('System', `'${nickname}' has joined the room`, getCurrentTime(), false, true);
    io.emit('message', newMessage);
    lastMessages.push(newMessage);
}

export const onTyping = (io: any, nickname: string) => {
    let index = typingUsers.indexOf(nickname);
    if (index === -1) {
        typingUsers.push(nickname);
    }
    io.emit('typing', formatTypingUsers());
}

export const onStopTyping = (io: any, nickname: string) => {
    var index = typingUsers.indexOf(nickname);
    typingUsers.splice(index, 1);
    io.emit('typing', formatTypingUsers());
}

const formatTypingUsers = () => {
    if (typingUsers.length === 0) {
        return '';
    }

    return `${typingUsers.join(", ")} ${typingUsers.length > 1 ? 'are' : 'is'} typing...`;
}