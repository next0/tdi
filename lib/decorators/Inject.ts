import 'reflect-metadata';
import {IDefinition} from '../types';
import {serializeName} from '../utils';
import {Container, container} from '../Container';

export function factoryInjectDecorator(container: Container) {
    return function Inject(name?: string) {
        // PropertyDecorator
        function propertyDecorator(target: any, key: string | symbol) {
            const type: FunctionConstructor = (<any> Reflect).getMetadata('design:type', target, key);

            let definition: IDefinition;

            if (typeof target === 'function') {
                // static method
                definition = {
                    name: serializeName(target),
                    module: target,
                    deps: {
                        staticProperties: {
                            [key]: name || serializeName(type)
                        }
                    }
                };
            } else if (typeof target.constructor === 'function') {
                // class method
                definition = {
                    name: serializeName(target.constructor),
                    module: target.constructor,
                    deps: {
                        properties: {
                            [key]: name || serializeName(type)
                        }
                    }
                };
            }

            container.registerDefinition(definition);
        }

        // ParameterDecorator
        function paramDecorator(target: any, key: string | symbol, index: number) {
            // const paramTypes: FunctionConstructor[] = (<any> Reflect).getMetadata('design:paramtypes', target, key) || [];
            // const type = paramTypes[index];

            throw new Error('Param decorators is unsupported');
        }

        // MethodDecorator
        function methodDecorator(target: any, key: string | symbol, descriptor: PropertyDescriptor) {
            const paramTypes: FunctionConstructor[] = (<any> Reflect).getMetadata('design:paramtypes', target, key) || [];

            let definition: IDefinition;

            if (typeof target === 'function') {
                // static method
                definition = {
                    name: serializeName(target),
                    module: target,
                    deps: {
                        staticMethods: {
                            [key]: paramTypes.map(serializeName)
                        }
                    }
                };
            } else if (typeof target.constructor === 'function') {
                // class method
                definition = {
                    name: serializeName(target.constructor),
                    module: target.constructor,
                    deps: {
                        methods: {
                            [key]: paramTypes.map(serializeName)
                        }
                    }
                };
            }

            container.registerDefinition(definition);
        }

        function decorator(target: any, key: string | symbol): void;
        function decorator(target: any, key: string | symbol, index: number): void;
        function decorator(target: any, key: string | symbol, descriptor: PropertyDescriptor): void;
        function decorator(target: any, key: string | symbol, options?: any): void {
            if (options === undefined) {
                propertyDecorator(target, key);
                return;
            }

            if (typeof options === 'number') {
                paramDecorator(target, key, options);
                return;
            }

            methodDecorator(target, key, options);
        }

        return decorator;
    };
}

export const Inject = factoryInjectDecorator(container);
