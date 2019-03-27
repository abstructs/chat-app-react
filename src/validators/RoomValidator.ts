import { LoginForm, UserService } from "../services/UserService";
import { Validator } from "./Validator";
import { RoomForm, RoomService } from "../services/RoomService";

export interface RoomFormErrors {
    name: string[],
    status: string[]
}

export class RoomValidator extends Validator {
    public static validateRoom(room: RoomForm): Promise<RoomFormErrors> {
        const { name, status } = room;

        let nameErrors: string[] = [];
        let statusErrors: string[] = [];

        if(this.isEmpty(name)) {
            nameErrors.push("Username cannot be empty");
        }

        if(this.isEmpty(status)) {
            statusErrors.push("Password cannot be empty");
        }

        return new Promise((resolve, reject) => {
            RoomService.validRoomName(name, () => {
                nameErrors.push("Username is already taken");

                resolve({ name: nameErrors, status: statusErrors });
            }, () => {
                resolve({ name: nameErrors, status: statusErrors });
            })
            
        });
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