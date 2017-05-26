import {expect} from 'chai';
import {Container} from '../lib/Container';
import {factoryProvideDecorator} from '../lib/decorators/Provide';
import {factoryInjectDecorator} from '../lib/decorators/Inject';

describe('Container', function () {
    let container: Container;
    let Provide: any;
    let Inject: any;

    beforeEach(function () {
        container = new Container();
        Provide = factoryProvideDecorator(container);
        Inject = factoryInjectDecorator(container);
    });

    it('should provide class sync', function () {
        class Logger {}
        class Connection {}

        @Provide()
        class Service {
            public name: string;
            public logger: Logger;
            public connection: Connection;
        }

        const service = container.getSync<Service>('Service');

        expect(service).to.be.instanceof(Service);
        expect(service.name).to.equal(undefined);
        expect(service.logger).to.equal(undefined);
        expect(service.connection).to.equal(undefined);
    });

    it('should provide class without dependencies', function () {
        class Logger {}
        class Connection {}

        @Provide()
        class Service {
            public name: string;
            public logger: Logger;
            public connection: Connection;
        }

        container.get<Service>('Service').then((service) => {
            expect(service).to.be.instanceof(Service);
            expect(service.name).to.equal(undefined);
            expect(service.logger).to.equal(undefined);
            expect(service.connection).to.equal(undefined);
        });
    });

    it('should provide class without dependencies with factory function', function () {
        class Logger {}
        class Connection {}

        class Service {
            public name: string;
            public logger: Logger;
            public connection: Connection;

            constructor(name: string) {
                this.name = name;
            }

            @Provide()
            public static factory() {
                return new Service('name');
            }
        }

        return container.get<Service>('Service').then((service) => {
            expect(service).to.be.instanceof(Service);
            expect(service.name).to.equal('name');
            expect(service.logger).to.equal(undefined);
            expect(service.connection).to.equal(undefined);
        });
    });

    it('should provide class without dependencies with async factory function', function () {
        class Logger {}
        class Connection {}

        class Service {
            public name: string;
            public logger: Logger;
            public connection: Connection;

            constructor(name: string) {
                this.name = name;
            }

            @Provide()
            public static factory() {
                return Promise.resolve(new Service('name'));
            }
        }

        return container.get<Service>('Service').then((service) => {
            expect(service).to.be.instanceof(Service);
            expect(service.name).to.equal('name');
            expect(service.logger).to.equal(undefined);
            expect(service.connection).to.equal(undefined);
        });
    });

    it('should throw error when get synchronously async definition', function () {
        class Logger {}
        class Connection {}

        class Service {
            public name: string;
            public logger: Logger;
            public connection: Connection;

            constructor(name: string) {
                this.name = name;
            }

            @Provide()
            public static factory() {
                return Promise.resolve(new Service('name'));
            }
        }

        const getSync = container.getSync.bind(container, 'Service');

        expect(getSync).to.throw(Error, /Definition 'Service' should be sync/);
    });

    it('should check factory function result', function () {
        class Logger {}
        class Connection {}

        class Service {
            public name: string;
            public logger: Logger;
            public connection: Connection;

            @Provide()
            public static factory() {
                return Promise.resolve(new Logger());
            }
        }

        return container.get<Service>('Service')
            .then(
                () => {
                    throw new Error('unexpected promise resolve');
                },
                (error) => {
                    expect(error).to.be.instanceof(Error);
                }
            );
    });

    it('should provide named class without dependencies', function () {
        class Logger {}
        class Connection {}

        @Provide('custom')
        class Service {
            public name: string;
            public logger: Logger;
            public connection: Connection;
        }

        return container.get<Service>('custom').then((service) => {
            expect(service).to.be.instanceof(Service);
            expect(service.name).to.equal(undefined);
            expect(service.logger).to.equal(undefined);
            expect(service.connection).to.equal(undefined);
        });
    });

    it('should provide named class without dependencies with factory function', function () {
        class Logger {}
        class Connection {}

        class Service {
            public name: string;
            public logger: Logger;
            public connection: Connection;

            constructor(name: string) {
                this.name = name;
            }

            @Provide('custom.factory')
            public static factory() {
                return new Service('name');
            }
        }

        return container.get<Service>('custom.factory').then((service) => {
            expect(service).to.be.instanceof(Service);
            expect(service.name).to.equal('name');
            expect(service.logger).to.equal(undefined);
            expect(service.connection).to.equal(undefined);
        });
    });

    it('should provide named class without dependencies with async factory function', function () {
        class Logger {}
        class Connection {}

        class Service {
            public name: string;
            public logger: Logger;
            public connection: Connection;

            constructor(name: string) {
                this.name = name;
            }

            @Provide('custom.factory')
            public static factory() {
                return Promise.resolve(new Service('name'));
            }
        }

        return container.get<Service>('custom.factory').then((service) => {
            expect(service).to.be.instanceof(Service);
            expect(service.name).to.equal('name');
            expect(service.logger).to.equal(undefined);
            expect(service.connection).to.equal(undefined);
        });
    });

    it('should check named factory function result', function () {
        class Logger {}
        class Connection {}

        class Service {
            public name: string;
            public logger: Logger;
            public connection: Connection;

            @Provide('custom.factory')
            public static factory() {
                return Promise.resolve(new Logger());
            }
        }

        return container.get<Service>('custom.factory')
            .then(
                () => {
                    throw new Error('unexpected promise resolve');
                },
                (error) => {
                    expect(error).to.be.instanceof(Error);
                }
            );
    });

});
