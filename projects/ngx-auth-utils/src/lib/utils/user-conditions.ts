import { Condition, ConditionOperators, UserType } from '../interfaces';

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

    public static evaluateConditions(user: UserType, operator: 'or' | 'and', conditions: Condition[]): boolean {
        if (operator === 'and') {
            return conditions.every((cond) => UserConditions.evaluateCondition(user, cond));
        }

        return conditions.some((cond) => UserConditions.evaluateCondition(user, cond));
    }

    public static evaluateCondition(user: UserType, condition: Condition): boolean {
        const res = this.evaluate(condition[1], user[condition[0]], condition[2]);
        return res;
    }

    public static evaluate(condition: ConditionOperators, userValue: unknown | unknown[], value: unknown | unknown[]): boolean {
        switch (condition) {
            case 'all':
                return UserConditions.hasAllValues(userValue as unknown[], value as unknown[]);
            case 'any':
                return UserConditions.hasAnyValues(userValue as unknown[], value as unknown[]);
            case 'none':
                return UserConditions.hasNoneOfTheValues(userValue as unknown[], value as unknown[]);
            case 'eq':
                return UserConditions.hasEqValue(userValue, value);
            case 'ne':
                return UserConditions.hasNeValue(userValue, value);
        }
        console.warn('Unknown condition ' + condition);
        return false;
    }
}
