import { expect } from 'chai';
// if you used the '@types/mocha' method to install mocha type definitions, uncomment the following line
import * as mocha from 'mocha';

import * as ask from '../../src';

const APP_ID = "app id yo.1123412341234123412341234123412341234234";

describe(`AlexaSkill basics`, () => {
    it(`should create base AlexaSkill without db`, () => {
        let skill = new ask.AlexaSkill(APP_ID, /*dynamoDbTableName*/ null);
        expect(skill).to.be.not.null;
    });
});