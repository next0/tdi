import {Provide, Inject} from '../../lib/index';
import {Fuel} from './Fuel';
import {Logger} from './Logger';

export enum ENGINE_STATE {
    'stopped',
    'running'
}

@Provide()
export class Engine {
    @Inject()
    private static logger: Logger;

    @Inject()
    private fuel: Fuel;
    private state: ENGINE_STATE;

    constructor() {
        Engine.logger.log('Engine.constructor');
        this.state = ENGINE_STATE.stopped;
    }

    public start() {
        Engine.logger.log('Engine.start');

        if (this.fuel.getLevel() > 0) {
            this.state = ENGINE_STATE.running;
        }
    }

    public getState() {
        return this.state;
    }
}
