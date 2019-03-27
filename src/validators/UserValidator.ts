import { LoginForm, UserService } from "../services/UserService";
import { Validator } from "./Validator";

export interface LoginFormErrors {
    username: string[],
    password: string[]
}

export class UserValidator extends Validator {
    public static validateLogin(user: LoginForm): LoginFormErrors {
        const { username, password } = user;

        let usernameErrors = [];
        let passwordErrors = [];

        if(this.isEmpty(username)) {
            usernameErrors.push("Username cannot be empty");
        }

        if(this.isEmpty(password)) {
            passwordErrors.push("Password cannot be empty");
        }

        return { username: usernameErrors, password: passwordErrors };
    }

    // private static getUsernameErrors(username: string): string[] {
    //     const errors = [];

    //     if(this.isEmpty(username)) {
    //         errors.push("Username cannot be empty");
    //     }

    //     // if(!this.validLength(username, 3, 15)) {
    //     //     errors.push("Username is ");
    //     // }

    //     return [];
    // }

    // private static getPasswordErrors(email: string): string[] {
    //     return [];
    // }
}