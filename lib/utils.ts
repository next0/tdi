import {HashMap} from './types';

export function combine(keys: string[], values: any[]): HashMap<any> {
    return keys.reduce((aggregator: HashMap<string>, key: string, ind: number) => {
        aggregator[key] = values[ind];
        return aggregator;
    }, {});
}

export function merge(first: any, second: any): any {
    if (first === null || first === undefined) {
        return second;
    }

    if (typeof first === 'object' && typeof second === 'object') {
        return Object.keys(second).reduce((aggregator, key) => {
            aggregator[key] = merge(first[key], second[key]);
            return aggregator;
        }, first);
    }

    return second;
}

export function clone(obj: any): any {
    const copy = JSON.parse(JSON.stringify(obj));
    return merge(copy, obj);
}

export function serializeName(target: Function): string {
    return (<any> target).name;
}
