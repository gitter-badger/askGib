import { expect } from 'chai';
// if you used the '@types/mocha' method to install mocha type definitions, uncomment the following line
import 'mocha';

export function hello1() {
    return 'Hello World!';
}

export default hello1;

describe('Hello function', () => {
    it('should return hello world 1', () => {
        const result = hello1();
        expect(result).to.equal('Hello World!');
    });
});