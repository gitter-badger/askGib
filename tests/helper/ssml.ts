import { expect } from 'chai';
// if you used the '@types/mocha' method to install mocha type definitions, uncomment the following line
import * as mocha from 'mocha';

import * as ask from '../../src';

const APP_ID = "app id yo.1123412341234123412341234123412341234234";

describe(`helper ssml`, () => {
    let h = new ask.Helper();
    const text = `Yo this is some text to be wrapped.`;
    const ssml = `<speak><p>${text}</p></speak>`;
    const ssmlParas = `<speak><p>${text}</p><p>${text}</p></speak>`;
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

    it(`stripSsml removes p, speak tags`, () => {
        let stripped = h.stripSsml(ssml);
        expect(stripped).to.equal(text);
    });
    it(`stripSsml removes p, speak tags, multiple paragraphs`, () => {
        let stripped = h.stripSsml(ssmlParas);
        expect(stripped).to.equal(`${text}\n\n${text}`);
    });



    const funk = `Funktacular`;
    const funkIPA = 'fʌŋktækjulɝ';
    const funkXSAMPA = 'fVNkt{kjul@`';
    it(`phoneme, default alphabet IPA`, () => {
        let phoneme = h.phoneme(funk, funkIPA);
        expect(phoneme).to.equal(`<phoneme alphabet="ipa" ph="${funkIPA}">${funk}</phoneme>`);
    });
    it(`phoneme, explicit alphabet IPA`, () => {
        let phoneme = h.phoneme(funk, funkIPA, "ipa");
        expect(phoneme).to.equal(`<phoneme alphabet="ipa" ph="${funkIPA}">${funk}</phoneme>`);
    });
    it(`phoneme, explicit alphabet X-SAMPA`, () => {
        let phoneme = h.phoneme(funk, funkXSAMPA, "x-sampa");
        expect(phoneme).to.equal(`<phoneme alphabet="x-sampa" ph="${funkXSAMPA}">${funk}</phoneme>`);
    });

    it(`emphasis, default level moderate`, () => {
        let emphasis = h.emphasis(funk);
        expect(emphasis).to.equal(`<emphasis level="moderate">${funk}</emphasis>`);
    });
    ["strong", "moderate", "reduced"].forEach(level => {
        it(`emphasis, explicit levels, ${level}`, () => {
            let emphasis = h.emphasis(funk, <any>level);
            expect(emphasis).to.equal(`<emphasis level="${level}">${funk}</emphasis>`);
        });
    });

    const rateStrings = ["x-slow", "slow", "medium", "fast", "x-fast"];
    rateStrings.forEach(rate => {
        it(`prosody, rate only, ${rate}`, () => {
            let prosody = h.prosody(funk, {rate: <any>rate});
            expect(prosody).to.equal(`<prosody rate="${rate}">${funk}</prosody>`);
        });
    });
    const pitchStrings = ["x-low", "low", "medium", "high", "x-high"];
    pitchStrings.forEach(pitch => {
        it(`prosody, pitch only, ${pitch}`, () => {
            let prosody = h.prosody(funk, {pitch: <any>pitch});
            expect(prosody).to.equal(`<prosody pitch="${pitch}">${funk}</prosody>`);
        });
    });
    const volumeStrings = ["silent", "x-soft", "soft", "medium", "loud", "x-loud"];
    volumeStrings.forEach(volume => {
        it(`prosody, volume only, ${volume}`, () => {
            let prosody = h.prosody(funk, {volume: <any>volume});
            expect(prosody).to.equal(`<prosody volume="${volume}">${funk}</prosody>`);
        });
    });

    const pitchMin = -33.3;
    const pitchMax = 50;
    it(`prosody, pitch, min`, () => {
        let pitch = pitchMin;
        let prosody = h.prosody(funk, {pitch: pitch});
        expect(prosody).to.equal(`<prosody pitch="${pitch}%">${funk}</prosody>`);
    });
    it(`prosody, pitch, max`, () => {
        let pitch = pitchMax;
        let prosody = h.prosody(funk, {pitch: pitch});
        expect(prosody).to.equal(`<prosody pitch="+${pitch}%">${funk}</prosody>`);
    });
    it(`prosody, pitch, over max`, () => {
        let pitch = pitchMax + 1;
        let prosody = h.prosody(funk, {pitch: pitch});
        expect(prosody).to.equal(`<prosody pitch="+${pitch}%">${funk}</prosody>`);
    });
    it(`prosody, pitch, under min`, () => {
        let pitch = pitchMin - 1;
        let prosody = h.prosody(funk, {pitch: pitch});
        expect(prosody).to.equal(`<prosody pitch="${pitch}%">${funk}</prosody>`);
    });
    const volumeMin = -12;
    const volumeMax = 4.08;
    it(`prosody, volume, min`, () => {
        let volume = volumeMin;
        let prosody = h.prosody(funk, {volume: volume});
        expect(prosody).to.equal(`<prosody volume="${volume}%">${funk}</prosody>`);
    });
    it(`prosody, volume, max`, () => {
        let volume = volumeMax;
        let prosody = h.prosody(funk, {volume: volume});
        expect(prosody).to.equal(`<prosody volume="+${volume}%">${funk}</prosody>`);
    });
    it(`prosody, volume, over max`, () => {
        let volume = volumeMax + 1;
        let prosody = h.prosody(funk, {volume: volume});
        expect(prosody).to.equal(`<prosody volume="+${volume}%">${funk}</prosody>`);
    });
    it(`prosody, volume, under min`, () => {
        let volume = volumeMin - 1;
        let prosody = h.prosody(funk, {volume: volume});
        expect(prosody).to.equal(`<prosody volume="${volume}%">${funk}</prosody>`);
    });
});