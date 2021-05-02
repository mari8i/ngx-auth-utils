export class UserConditions {
    public static hasAllValues(userValues: unknown[], values: unknown[]): boolean {
        const res: boolean = values.every((v) => userValues.includes(v));
        return res;
    }

    public static hasAnyValues(userValues: unknown[], values: unknown[]): boolean {
        const res: boolean = userValues.some((uv) => values.includes(uv));
        return res;
    }

    public static hasNoneOfTheValues(userValues: unknown[], values: unknown[]): boolean {
        const res = !this.hasAnyValues(userValues, values);
        return res;
    }

    public static hasEqValue(userValue: unknown, value: unknown): boolean {
        return userValue === value;
    }

    public static hasNeValue(userValue: unknown, value: unknown): boolean {
        return userValue !== value;
    }
}
