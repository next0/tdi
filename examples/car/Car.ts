import {Provide, Inject} from '../../lib/index';
import {Engine, ENGINE_STATE} from './Engine';
import {Logger} from './Logger';

@Provide()
export class Car {
    @Inject()
    private static logger: Logger;

    private engine: Engine;

    constructor(engine: Engine) {
        Car.logger.log('Car.constructor');
        this.engine = engine;
    }

    public run() {
        Car.logger.log('Car.run');
        this.engine.start();
    }

    public isRunning() {
        return this.engine.getState() === ENGINE_STATE.running;
    }
}
