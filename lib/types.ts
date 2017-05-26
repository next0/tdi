export type HashMap<T> = {
    [key: string]: T
};

export type MemberName = string | symbol;

export interface IDefinitionDeps {
    initialize?: string[];

    methods?: HashMap<string[]>;
    properties?: HashMap<string>;

    staticMethods?: HashMap<string[]>;
    staticProperties?: HashMap<string>;
}

export interface IDefinition {
    name?: string;
    factory?: MemberName;
    module?: FunctionConstructor;
    deps?: IDefinitionDeps;
}
