import {ENGINE_STATE} from '../Engine';

export class EngineStoppedMock {
    public start() {
        // noop
    }

    public getState() {
        return ENGINE_STATE.stopped;
    }
}
