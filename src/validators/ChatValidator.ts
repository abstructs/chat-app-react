import { LoginForm, UserService } from "../services/UserService";
import { Validator } from "./Validator";
import { RoomForm, RoomService } from "../services/RoomService";

export interface MessageErrors {
    message: string[]
}

export class ChatValidator extends Validator {
    public static validateUsername(username: string): string[] {
        const errors: string[] = [];
        if(username == undefined || username.length == 0) {
            errors.push("Username can't be blank");
        }

        if(username.length > 15) {
            errors.push("Username must be below 15 characters");
        }

        return errors;
    }

    public static validateMessage(message: string): string[] {
        const errors: string[] = [];

        if(message.length === 0) {
            errors.push("Should be not be blank");
        }

        if(message.length > 140) {
            errors.push("Should be less than or equal to 140 characters");
        }

        return errors;
    }
}