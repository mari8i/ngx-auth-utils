export class UserConditions {
    public static hasAllValues(userValues: unknown[], values: unknown[]): boolean {
        return values.every((v) => userValues.includes(v));
    }

    public static hasAnyValues(userValues: unknown[], values: unknown[]): boolean {
        return userValues.some((uv) => values.includes(uv));
    }

    public static hasNoneOfTheValues(userValues: unknown[], values: unknown[]): boolean {
        return !this.hasAnyValues(userValues, values);
    }

    public static hasEqValue(userValue: unknown, value: unknown): boolean {
        return userValue === value;
    }

    public static hasNeValue(userValue: unknown, value: unknown): boolean {
        return userValue !== value;
    }
}
