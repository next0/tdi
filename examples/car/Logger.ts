import {Provide} from '../../lib/index';

@Provide()
export class Logger {
    public log(message: any) {
        console.log(message);
    }
}
