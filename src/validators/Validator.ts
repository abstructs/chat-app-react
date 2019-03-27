export abstract class Validator {
    protected static validLength(str: string, min: number, max: number): boolean {
        return str.length >= min && str.length <= max;
    }

    protected static isEmpty(str: string): boolean {
        return str == null || str.length == 0;
    }
}