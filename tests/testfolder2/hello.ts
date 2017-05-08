import { expect } from 'chai';
// if you used the '@types/mocha' method to install mocha type definitions, uncomment the following line
import 'mocha';

export function hello2() {
    return 'Hello World!';
}

export default hello2;

describe('Hello function', () => {
    it('should return hello world 2', () => {
        const result = hello2();
        expect(result).to.equal('Hello World!');
    });
});