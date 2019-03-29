import { Service } from './Service';
import axios, { AxiosResponse } from 'axios';
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

    public static findAllAuth(onSuccess: (rooms: Room[]) => void, onReject: (reason: any) => void) {
        axios.post(`${super.getApiUrl()}/room/getRooms`, {},
            { headers: { ...super.getAuthHeader() }})
        .then(res => {
            onSuccess(res.data.rooms);
        })
        .catch(onReject);
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
        console.log(roomName)
        return axios.get(`${super.getApiUrl()}/chat/users/${roomName}`)
            .then((res) => res.data["usernames"]);
    }
}