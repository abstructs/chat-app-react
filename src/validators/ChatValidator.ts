import { LoginForm, UserService } from "../services/UserService";
import { Validator } from "./Validator";
import { RoomForm, RoomService } from "../services/RoomService";

// export interface RoomFormErrors {
//     name: string[],
//     status: string[]
// }

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
}