import * as Cookies from 'js-cookie';

export abstract class Service {
    protected static getApiUrl(): string {
        return "http://localhost:8000";
    }

    protected getApiUrl(): string {
        return Service.getApiUrl();
    }

    protected static getToken(): string | undefined {
        return Cookies.get("token");
    }

    protected static getAuthHeader(): object {
        return {
            'Authorization': `Bearer ${this.getToken()}`
        };
    }
}