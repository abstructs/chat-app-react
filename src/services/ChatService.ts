import { Service } from './Service';
import io from 'socket.io-client';

export enum MessageType {
    join, disconnect, message
}

export interface ChatMessage {
    username: String;
    message: String;
    type: MessageType;
}

export interface ChatLog {
    username: String;
    message: String;
    event: MessageType;
}

export class ChatService extends Service {

    private socket: SocketIOClient.Socket;

    constructor(onMessage: (message: ChatMessage) => void, onDisconnect: () => void) {
        super();

        this.socket = io.connect(`${super.getApiUrl()}`);

        this.socket.on("error", () => {
            this.socket.removeAllListeners();
            console.error("Socket error, bad request");
        });

        this.socket.on("disconnect", onDisconnect);

        this.socket.on("newMessage", onMessage);

        this.socket.on("roomInactive", () => {
            onDisconnect();
        })
    }

    connectToRoom(roomName: string, username: string): Promise<Boolean> {
        return new Promise((resolve, _) => {
            this.socket.emit("connectToRoom", { roomName, username });

            this.socket.on("joinedRoom", () => {
                this.socket.removeListener("joinedRoom");
                this.socket.removeListener("invalidRoom");
                resolve(true);
            });

            this.socket.on("invalidRoom", () => {
                this.socket.removeListener("joinedRoom");
                this.socket.removeListener("invalidRoom");
                resolve(false);
            });
        })
    }

    sendMessage(message: string) {
        this.socket.emit("message", { message });
    }

    leaveRoom(roomName: string, username: string): Promise<Boolean> {
        return new Promise((resolve, reject) => {
            this.socket.emit("leaveRoom", { username, roomName });

            this.socket.on("leftRoom", () => {
                this.socket.removeListener("leftRoom");
                resolve(true);
            });
        });
    }

    validChatUsername(roomName: string, username: string): Promise<Boolean> {
        return new Promise((resolve, reject) => {
            this.socket.emit("validChatUsername", { roomName, username });

            this.socket.on("validUsername", () => {
                this.socket.removeListener("validUsername");
                this.socket.removeListener("invalidUsername");
                resolve(true);
            });

            this.socket.on("invalidUsername", () => {
                this.socket.removeListener("validUsername");
                this.socket.removeListener("invalidUsername");
                resolve(false);
            });
        });
    }
}