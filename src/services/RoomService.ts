import { Service } from './Service';
import axios, { AxiosResponse } from 'axios';
import { ChatMessage } from './ChatService';
// import * as Cookies from 'js-cookie';

export enum RoomStatus {
    active = "active", inactive = "inactive"
}

export interface RoomForm {
    _id: string | null,
    name: string,
    status: string
}

export interface Room {
    _id: string,
    name: string,
    status: string,
    createdAt: string,
    updatedAt: string,
    user: {
        username: string
    }
}

export class RoomService extends Service {
    public static findAll(onSuccess: (rooms: Room[]) => void, onReject: (reason: any) => void) {
        axios.get(`${super.getApiUrl()}/room`)
        .then(res => {
            onSuccess(res.data.rooms);
        })
        .catch(onReject);
    }

    public static deleteRoom(roomId: string): Promise<Boolean> {
        return axios.delete(`${super.getApiUrl()}/room`,
                { headers: { ...super.getAuthHeader() }, data: { roomId } })
                .then(res => {
                    return res.status == 200;
                });
    }

    public static getRooms(page: number, rowsPerPage: number): Promise<{ rooms: Room[], roomsCount: number }> {
        const body = {
            page,
            rowsPerPage
        }

        return axios.post(`${super.getApiUrl()}/room/getRooms`, body,
            { headers: { ...super.getAuthHeader() }})
                .then(res => { 
                    const rooms = res.data.rooms;
                    const roomsCount = res.data.roomsCount;

                    return { rooms, roomsCount };
                });
    }

    public static roomExists(name: string, onSuccess: () => void, onReject: (reason: any) => void) {
        axios.get(`${super.getApiUrl()}/room/exists/${name}`)
        .then(onSuccess)
        .catch(onReject);
    }

    public static save(roomForm: RoomForm, onSuccess: () => void, onReject: (reason: any) => void) {
        const payload = {
            room: roomForm
        }

        axios.post(`${super.getApiUrl()}/room`, payload,
            { headers: { ...super.getAuthHeader() }})
        .then(onSuccess)
        .catch(onReject);
    }

    public static edit(roomForm: RoomForm, onSuccess: () => void, onReject: (reason: any) => void) {
        const payload = {
            room: roomForm
        }

        axios.put(`${super.getApiUrl()}/room`, payload,
            { headers: { ...super.getAuthHeader() }})
        .then(onSuccess)
        .catch(onReject);
    }

    public static viewConnected(roomName: string): Promise<String[]> {
        return axios.get(`${super.getApiUrl()}/chat/users/${roomName}`)
            .then((res) => res.data["usernames"]);
    }

    public static getMessages(roomName: string, pageNumber: number, beforeTime: Date): Promise<ChatMessage[]> {
        const payload = {
            roomName,
            pageNumber,
            beforeTime
        }
        
        return axios.post(`${super.getApiUrl()}/room/messages`, payload)
            .then((res) => res.data["messages"]);
    }
}