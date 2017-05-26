export type ChainFunction<T, U> = (value: T) => U | Thenable<U>;

function isAsync<T>(obj: any): obj is Thenable<T> {
    return (obj && typeof obj.then === 'function');
}

function unwrap(value: any) {
    return (value instanceof MaybePromise) ? value.unwrap() : value;
}

export class MaybePromise<T> implements Thenable<T> {
    protected payload: T | Thenable<T>;
    protected error: any;

    constructor(payload: T | Thenable<T>, error?: any) {
        this.payload = payload;
        this.error = error;
    }

    public then<U>(success?: ChainFunction<T, U>, fail?: ChainFunction<any, U>): MaybePromise<U> {
        const payload = this.payload;
        const error = this.error;

        if (isAsync(payload)) {
            return MaybePromise.resolve(
                payload.then(success, fail)
            );
        }

        if (error && fail) {
            return this.handle(fail, error);
        } else if (success) {
            return this.handle(success, payload);
        }
    }

    public catch<U>(fail: ChainFunction<any, U>): MaybePromise<U> {
        return this.then(null, fail);
    }

    public isAsync(): boolean {
        return isAsync(this.payload);
    }

    public unwrap(): T | Thenable<T> {
        if (this.error) {
            throw this.error;
        }

        return this.payload;
    }

    protected handle<U>(fn: ChainFunction<T, U>, payload: T): MaybePromise<U> {
        try {
            const res = fn(payload);

            return MaybePromise.resolve(res);
        } catch (error) {
            return MaybePromise.reject(error);
        }
    }

    public static resolve<T>(payload?: T | Thenable<T>): MaybePromise<T> {
        return new MaybePromise(unwrap(payload));
    }

    public static reject(error: any): MaybePromise<any> {
        return new MaybePromise(undefined, error);
    }

    public static all<T1, T2, T3, T4, T5>(values: [T1 | Thenable<T1>, T2 | Thenable<T2>, T3 | Thenable<T3>, T4 | Thenable<T4>, T5 | Thenable<T5>]): MaybePromise<[T1, T2, T3, T4, T5]>;
    public static all<T1, T2, T3, T4>(values: [T1 | Thenable<T1>, T2 | Thenable<T2>, T3 | Thenable<T3>, T4 | Thenable<T4>]): MaybePromise<[T1, T2, T3, T4]>;
    public static all<T1, T2, T3>(values: [T1 | Thenable<T1>, T2 | Thenable<T2>, T3 | Thenable<T3>]): MaybePromise<[T1, T2, T3]>;
    public static all<T1, T2>(values: [T1 | Thenable<T1>, T2 | Thenable<T2>]): MaybePromise<[T1, T2]>;
    public static all<T>(values: [T | Thenable<T>]): MaybePromise<[T]>;
    public static all<T>(values: Array<T | Thenable<T>>): MaybePromise<T[]>;
    public static all<T>(values: Array<T | Thenable<T>>): MaybePromise<T[]> {
        try {
            const data = values.map(unwrap);
            const isAsyncResult = data.some(isAsync);
            const payload = isAsyncResult ? Promise.all(data) : data;

            return MaybePromise.resolve(payload);
        } catch (error) {
            return MaybePromise.reject(error);
        }
    }

    public static race<T>(values: Array<T | Thenable<T>>): MaybePromise<T> {
        try {
            const data = values.map(unwrap);
            const isAsyncResult = data.some(isAsync);
            const payload = isAsyncResult ? Promise.race(data) : data[0];

            return MaybePromise.resolve(payload);
        } catch (error) {
            return MaybePromise.reject(error);
        }
    }
}
