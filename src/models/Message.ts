export class Message
{
    constructor(sender: string, content: string, time: string, isImage: boolean = false, isSystemMessage: boolean = false)
    {
        this.sender = sender;
        this.content = content;
        this.time = time;
        this.isImage = isImage;
        this.isSystemMessage = isSystemMessage;
    }

    sender: string = "";
    content: string = "";
    time: string = "";
    isImage: boolean = false;
    isSystemMessage: boolean = false;
}