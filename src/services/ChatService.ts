import { Service } from './Service';
import axios, { AxiosResponse } from 'axios';
import io from 'socket.io-client';
// import * as Cookies from 'js-cookie';
// export enum Message {
// }

export enum MessageType {
    join, disconnect, message
}

export interface ChatMessage {
    username: String;
    message: String;
    type: MessageType;
}

export class ChatService extends Service {

    private socket: SocketIOClient.Socket;

    constructor() {
        super();

        this.socket = io.connect(`${super.getApiUrl()}`);
    }

    connectToRoom(roomName: string, username: string): Promise<Boolean> {
        return new Promise((resolve, reject) => {
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

            this.socket.on("error", () => {
                this.socket.removeListener("joinedRoom");
                this.socket.removeListener("invalidRoom");
                reject();
            });
        })


    }

    validChatUsername(roomName: string, username: string): Promise<Boolean> {
        return new Promise((resolve, reject) => {
            this.socket.emit("validChatUsername", { roomName, username });

            this.socket.on("validUsername", () => {
                resolve(true);
            });

            this.socket.on("inValidUsername", () => {
                resolve(false);
            })

            this.socket.on("error", () => {
                reject();
            });
        });
    }

    // connect(room: String, onMessage: (message: ChatMessage) => void) {
    //     const token = this.getToken();

    //     this.socket = io.connect({ query: { token, room }, forceNew: true });

    //     this.socket.on('join', (data) => {
    //         const message: ChatMessage = data;

    //         message.type = MessageType.join;

    //         onMessage(message);
    //     });

    //     this.socket.on('left', (data) => {
    //         const message: ChatMessage = data;

    //         if (typeof (message) != 'string') {
    //             message.type = MessageType.disconnect;

    //             onMessage(message);
    //         }
    //     });

    //     this.socket.on('message', (data) => {
    //         const message: ChatMessage = data;

    //         message.type = MessageType.message;

    //         onMessage(message);
    //     });
    // }

    // message(message) {
    //     this.socket.emit('message', { message });
    // }

    // viewConnected(roomName): Observable<String[]> {
    //     return this.backend.getConnected(roomName).pipe(
    //         map(res => {
    //             const usernames = res['usernames'];

    //             return usernames;
    //         }),
    //         catchError(err => {
    //             return of([]);
    //         })
    //     );
    // }
}