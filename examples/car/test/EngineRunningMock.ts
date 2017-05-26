import {ENGINE_STATE} from '../Engine';

export class EngineRunningMock {
    public start() {
        // noop
    }

    public getState() {
        return ENGINE_STATE.running;
    }
}
