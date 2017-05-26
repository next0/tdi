import {Provide, Inject} from '../../lib/index';
import {Logger} from './Logger';

@Provide()
export class Fuel {
    @Inject()
    private static logger: Logger;

    constructor() {
        Fuel.logger.log('Fuel.constructor');
    }

    public getLevel() {
        return 50;
    }
}
