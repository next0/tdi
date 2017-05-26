import {container} from '../../lib/index';
import {Car} from './Car';

const car = container.getSync<Car>(Car);

car.run();

if (car.isRunning()) {
    console.log('The car is running');
} else {
    console.log('The car is stopped');
}
