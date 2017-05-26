import {expect} from 'chai';
import {Car} from '../Car';
import {Engine} from '../Engine';
import {Logger} from '../Logger';
import {EngineRunningMock} from './EngineRunningMock';
import {EngineStoppedMock} from './EngineStoppedMock';
import {LoggerMock} from './LoggerMock';

import {IDefinition} from '../../../lib/types';
import {serializeName} from '../../../lib/utils';
import {Container, container} from '../../../lib/index';

function mockDefinition(orig: string | Function, mock: Function): IDefinition {
    return {
        name: (typeof orig === 'function') ? serializeName(orig) : orig,
        module: <FunctionConstructor> mock,
        deps: {}
    };
}

describe('Car', function () {
    let box: Container;

    beforeEach(function () {
        box = container.clone();
        box.registerDefinition(mockDefinition(Logger, LoggerMock));
    });

    it('is running', function () {
        box.registerDefinition(mockDefinition(Engine, EngineRunningMock));

        const car = box.getSync<Car>(Car);

        expect(car.isRunning()).to.equal(true);
    });

    it('is stopped', function () {
        box.registerDefinition(mockDefinition(Engine, EngineStoppedMock));

        const car = box.getSync<Car>(Car);

        expect(car.isRunning()).to.equal(false);
    });

});
