import { Service } from './Service';
import axios, { AxiosResponse } from 'axios';
import Events from 'material-ui/utils/events';

export interface Event {
    roomName: string,
    username: string,
    createdAt: string,
    type: string,
    // ppid: string
}

export interface ChatEvent {
    roomName: string,
    username: string,
    createdAt: string,
    type: string,
    message: string
}

export class EventService extends Service {
    // promise returns a list of events and the pageCount
    public static getEventHistory(page: number, rowsPerPage: number): Promise<{events: Event[], eventsCount: number}> {
        return axios.get(`${super.getApiUrl()}/api/eventlog/${page}/${rowsPerPage}`)
        .then(res => {
            const logs = res.data.logs;
            const eventsCount = res.data.eventsCount;

            return { events: logs, eventsCount };
        });
    }

    public static getChatEventHistory(page: number, rowsPerPage: number): Promise<{chatEvents: ChatEvent[], eventsCount: number}> {
        return axios.get(`${super.getApiUrl()}/api/history/${page}/${rowsPerPage}`)
        .then(res => {
            const logs = res.data.logs;
            const eventsCount = res.data.eventsCount;

            return { chatEvents: logs, eventsCount };
        });
    }

    public static getEventHistoryPageCount(): Promise<Event[]> {
        return axios.get(`${super.getApiUrl()}/api/eventlog/pageCount`)
        .then(res => {
            const logs = res.data.logs;

            return logs;
        });
    }

    public static getChatHistory(): Promise<Event[]> {
        return axios.get(`${super.getApiUrl()}/api/eventlog`)
        .then(res => res.data.logs);
    }
}