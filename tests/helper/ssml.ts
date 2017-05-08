import { expect } from 'chai';
// if you used the '@types/mocha' method to install mocha type definitions, uncomment the following line
import * as mocha from 'mocha';

import * as ask from '../../src';

const APP_ID = "app id yo.1123412341234123412341234123412341234234";

describe(`helper ssml`, () => {
    let h = new ask.Helper();
    const text = `Yo this is some text to be wrapped.`;
    const ssml = `<speak><p>${text}</p></speak>`;
    it(`wrapSsmlSpeak in speak tags with default param addParaTags`, () => {
        let wrapped = h.wrapSsmlSpeak([text]); // /*addParaTags*/ true
        expect(wrapped).to.equal(ssml);
    });
    it(`wrapSsmlSpeak in speak tags with addParaTags true`, () => {
        let wrapped = h.wrapSsmlSpeak([text], /*addParaTags*/ true);
        expect(wrapped).to.equal(ssml);
    });
    it(`wrapSsmlSpeak in speak tags with addParaTags false`, () => {
        let wrapped = h.wrapSsmlSpeak([text], /*addParaTags*/ false);
        expect(wrapped).to.equal(`<speak>${text}</speak>`);
    });

    it(`wrapSsmlSpeak, multi paras, addParaTags true`, () => {
        let wrapped = h.wrapSsmlSpeak([text, text, text]);
        const ssml3 = `<speak><p>${text}</p><p>${text}</p><p>${text}</p></speak>`;
        expect(wrapped).to.equal(ssml3);
    });

    it(`unwrapSsmlSpeak removes speak tags`, () => {
        let unwrapped = h.unwrapSsmlSpeak(ssml);
        expect(unwrapped).to.equal(`<p>${text}</p>`);
    });
});