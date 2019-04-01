import { Service } from './Service';
import axios, { AxiosResponse } from 'axios';
import * as Cookies from 'js-cookie';

export interface SignupForm {
    username: string,
    password: string,
    password_confirmation: string
}

export interface LoginForm {
    username: string,
    password: string
}

export interface UserFormErrors {
    email: string,
    password: string
}

export class UserService extends Service {

    // constructor() {
    //     super();
    // }

    private static storeToken(token: string): void {
        const today = new Date();
        const oneWeek = new Date(new Date().setDate(today.getDate() + 7));

        Cookies.set("token", token, {
            expires: oneWeek,
            path: ''
        });
    }

    public static revokeToken() {
        Cookies.remove("token");
    }

    public static hasToken(): boolean {
        return Cookies.get("token") != null;
    }

    public static validToken(): Promise<Boolean> {
        return axios.post(`${super.getApiUrl()}/user/auth`, {}, 
            { headers: { ...super.getAuthHeader() }})
        .then(_ => true)
        .catch(_ => false);
    }

    public static emailTaken(email: string, callback: (emailTaken: boolean) => void) {
        const payload = {
            user: {
                email
            }
        }

        axios.post(`${super.getApiUrl()}/user/valid-username`, payload)
        .then(_ => {
            callback(true);
        })
        .catch(_ => {
            callback(false);
        });
    }

    public static authenticate(loginForm: LoginForm, onSuccess: (res: AxiosResponse) => void, onReject: (reason: any) => void) {
        const payload = {
            user: {
                ...loginForm
            }
        }

        axios.post(`${super.getApiUrl()}/user/login`, payload)
        .then(res => {
            this.storeToken(res.data.auth.token);
            
            return res;
        })
        .then(onSuccess)
        .catch(onReject);
    }

    public static signup(signupForm: SignupForm, onSuccess: (res: AxiosResponse) => void, onReject: (reason: any) => void) {
        const payload = {
            user: {
                ...signupForm
            }
        }

        const loginForm: LoginForm = {
            username: signupForm.username,
            password: signupForm.password
        };

        axios.post(`${super.getApiUrl()}/signup`, payload)
        .then(_ => this.authenticate(loginForm, onSuccess, onReject))
        .catch(onReject);
    }
}