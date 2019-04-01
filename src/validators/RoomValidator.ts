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
            nameErrors.push("Name cannot be empty");
        }

        if(name.length >= 20) {
            nameErrors.push("Name should be smaller than 20 characters");
        }

        statusErrors.concat(this.validateStatus(status));

        return new Promise((resolve, reject) => {
            RoomService.roomExists(name, () => {
                nameErrors.push("Name already taken");

                resolve({ name: nameErrors, status: statusErrors });
            }, () => {
                resolve({ name: nameErrors, status: statusErrors });
            }) 
        });
    }



    public static validateStatus(status: string): string[] {
        const errors = [];

        if(this.isEmpty(status)) {
            errors.push("Status cannot be empty");
        }

        if(status != "active" && status != "inactive") {
            errors.push("Status invalid");
        }

        // if(!this.validLength(username, 3, 15)) {
        //     errors.push("Username is ");
        // }

        return errors;
    }

    // private static getPasswordErrors(email: string): string[] {
    //     return [];
    // }
}