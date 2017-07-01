import {expect} from 'chai';
import {MaybePromise} from '../lib/MaybePromise';

function result<T>(payload: T) {
    return new Promise<T>((resolve) => {
        setTimeout(() => resolve(payload), 10);
    });
}

describe('MaybePromise', function () {

    it('should support chaining for sync', function () {
        const maybePromise = MaybePromise.resolve(0)
            .then((value) => value + 1)
            .then((value) => value + 2)
            .then((value) => value + 3)
            .then((value) => value + 4);

        expect(maybePromise.isAsync()).to.equal(false);
        expect(maybePromise.unwrap()).to.equal(10);

        return maybePromise.then((value: number) => {
            expect(value).to.equal(10);
        });
    });

    it('should support chaining for async', function () {
        const maybePromise = MaybePromise.resolve(result(0))
            .then((value) => result(value + 1))
            .then((value) => result(value + 2))
            .then((value) => result(value + 3))
            .then((value) => result(value + 4));

        expect(maybePromise.isAsync()).to.equal(true);
        expect(maybePromise.unwrap()).to.be.instanceof(Promise);

        return maybePromise.then((value) => {
            expect(value).to.equal(10);
        });
    });

    it('should support chaining for sync and async', function () {
        const maybePromise = MaybePromise.resolve(0)
            .then((value) => value + 1)
            .then((value) => result(value + 2))
            .then((value) => value + 3)
            .then((value) => value + 4);

        expect(maybePromise.isAsync()).to.equal(true);
        expect(maybePromise.unwrap()).to.be.instanceof(Promise);

        return maybePromise.then((value) => {
            expect(value).to.equal(10);
        });
    });

    it('should throw error', function () {
        const maybePromise = MaybePromise.resolve(0)
            .then((value) => value + 1)
            .then((value) => {
                if (value === 1) {
                    throw new Error('invalid input value');
                }

                return value + 2;
            })
            .then((value) => value + 3)
            .then((value) => value + 4);

        const unwrap = maybePromise.unwrap.bind(maybePromise);

        expect(maybePromise.isAsync()).to.equal(false);
        expect(unwrap).to.throw(Error);
    });

    it('should support catch error', function () {
        const maybePromise = MaybePromise.resolve(0)
            .then((value) => value + 1)
            .then((value) => {
                if (value === 1) {
                    throw new Error('invalid input value');
                }

                return value + 2;
            })
            .then((value) => value + 3)
            .catch(() => 0)
            .then((value) => value + 5);

        expect(maybePromise.isAsync()).to.equal(false);
        expect(maybePromise.unwrap()).to.equal(5);

        return maybePromise.then((value: number) => {
            expect(value).to.equal(5);
        });
    });

});
