import {IDefinition, HashMap} from './types';
import {combine, merge, clone, serializeName} from './utils';
import {MaybePromise} from './MaybePromise';

export class Container {
    protected definitions: HashMap<IDefinition>;
    protected classes: HashMap<any>;
    protected instances: HashMap<any>;

    constructor(definitions: HashMap<IDefinition> = {}) {
        this.definitions = definitions;
        this.classes = {};
        this.instances = {};
    }

    public destroy() {
        this.definitions = {};
        this.classes = {};
        this.instances = {};
    }

    public clone(): Container {
        return new Container(clone(this.definitions));
    }

    public registerDefinition(definition: IDefinition) {
        this.definitions[definition.name] = merge(this.definitions[definition.name], definition);
    }

    public getSync<T>(id: string | Function): T {
        const name = this.normalizeId(id);
        const result = this.getInstance<T>(name);

        if (result.isAsync()) {
            throw new Error(`Definition '${name}' should be sync`);
        }

        return <T> result.unwrap();
    }

    public get<T>(id: string | Function): Promise<T> {
        const name = this.normalizeId(id);

        return new Promise((resolve, reject) => {
            this.getInstance<T>(name).then(resolve, reject);
        });
    }

    protected normalizeId(id: string | Function): string {
        return (typeof id === 'function') ? serializeName(id) : id;
    }

    protected getInstance<T>(name: string): MaybePromise<T> {
        const definition = this.definitions[name];

        if (!definition) {
            return MaybePromise.reject(new Error(`Definition '${name}' not found`));
        }

        if (!this.instances[name]) {
            const {factory, deps} = definition;

            this.instances[name] = MaybePromise.resolve()
                .then(() => this.getInstanceClass(name))
                .then((InstanceClass) => {
                    return MaybePromise.all([
                        InstanceClass,
                        this.resolveDeps(deps.initialize)
                    ]);
                })
                .then(([InstanceClass, initializeInstances]) => {
                    let instance: T;

                    if (factory) {
                        instance = <T> ((<any> InstanceClass)[factory](...initializeInstances));
                    } else {
                        instance = <T> (new (<any> InstanceClass)(...initializeInstances));
                    }

                    return MaybePromise.all([
                        InstanceClass,
                        instance,
                        this.resolvePropertiesDeps(deps.properties || {}),
                        this.resolveMethodsDeps(deps.methods || {})
                    ]);
                })
                .then(([InstanceClass, instance, propertyInstances, methodsInstances]) => {
                    if (!(<T> instance instanceof InstanceClass)) {
                        throw new Error(`Instance for definition '${name}' from factory '${factory}' is not instance of '${(<any> InstanceClass).name}'`);
                    }

                    Object.keys(propertyInstances).forEach((key: keyof T) => {
                        instance[key] = propertyInstances[key];
                    });

                    Object.keys(methodsInstances).forEach((key: keyof T) => {
                        (<any> instance[key])(...methodsInstances[key]);
                    });

                    return instance;
                });
        }

        return this.instances[name];
    }

    protected getInstanceClass(name: string): MaybePromise<FunctionConstructor> {
        if (!this.classes[name]) {
            const definition = this.definitions[name];
            const {module, deps} = definition;

            const promises = [
                this.resolvePropertiesDeps(deps.staticProperties || {}),
                this.resolveMethodsDeps(deps.staticMethods || {})
            ];

            this.classes[name] = MaybePromise.all(promises)
                .then(([propertyInstances, methodsInstances]) => {
                    Object.keys(propertyInstances).forEach((key: string) => {
                        (<any> module)[key] = propertyInstances[key];
                    });

                    Object.keys(methodsInstances).forEach((key: string) => {
                        (<any> module)[key](...methodsInstances[key]);
                    });

                    return module;
                });
        }

        return this.classes[name];
    }

    protected resolvePropertiesDeps(properties: HashMap<string>): MaybePromise<HashMap<any>> {
        const keys = Object.keys(properties);
        const names = keys.map((key) => properties[key]);

        return this.resolveDeps(names)
            .then((instances: any[]) => combine(keys, instances));
    }

    protected resolveMethodsDeps(methods: HashMap<string[]>): MaybePromise<HashMap<any[]>> {
        const keys = Object.keys(methods);
        const groups = keys.map((key) => this.resolveDeps(methods[key]));

        return MaybePromise.all(groups)
            .then((instances: any[][]) => combine(keys, instances));
    }

    protected resolveDeps(names: string[]): MaybePromise<any[]> {
        return MaybePromise.all(names.map((name) => this.getInstance(name)));
    }
}

export const container = new Container();
