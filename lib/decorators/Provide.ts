import 'reflect-metadata';
import {IDefinition} from '../types';
import {serializeName} from '../utils';
import {Container, container} from '../Container';

export function factoryProvideDecorator(container: Container) {
    return function Provide(name?: string) {
        // ClassDecorator
        function classDecorator(target: Function) {
            const paramTypes: FunctionConstructor[] = (<any> Reflect).getMetadata('design:paramtypes', target) || [];

            let definition: IDefinition;

            definition = {
                name: name || serializeName(target),
                module: <FunctionConstructor> target,
                deps: {
                    initialize: paramTypes.map(serializeName)
                }
            };

            container.registerDefinition(definition);
        }

        // MethodDecorator
        function methodDecorator(target: any, key: string | symbol, descriptor: PropertyDescriptor) {
            const paramTypes: FunctionConstructor[] = (<any> Reflect).getMetadata('design:paramtypes', target, key) || [];

            let definition: IDefinition;

            if (typeof target === 'function') {
                // static method
                definition = {
                    name: name || serializeName(target),
                    factory: key,
                    module: target,
                    deps: {
                        initialize: paramTypes.map(serializeName)
                    }
                };
            } else if (typeof target.constructor === 'function') {
                // class method
                throw new Error('Class method decorator is unsupported');
            }

            container.registerDefinition(definition);
        }

        function decorator(target: Function): void;
        function decorator(target: any, key: string | symbol, descriptor: PropertyDescriptor): void;
        function decorator(target: Function, key?: string | symbol, options?: any): void {
            if (key === undefined && options === undefined) {
                classDecorator(target);
                return;
            }

            methodDecorator(target, key, options);
        }

        return decorator;
    };
}

export const Provide = factoryProvideDecorator(container);
