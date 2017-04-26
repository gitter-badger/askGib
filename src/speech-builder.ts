import * as ask from './alexa-skills-kit';

import * as help from './helper';
let h = new help.Helper();


/**
 * Builds an OutputSpeech object that contains both text and ssml.
 * The text is convenient for showing information on cards, while
 * building the ssml at the same time.
 * 
 * The OutputSpeech.type is always ssml.
 * 
 * To create the actual OutputSpeech object, call `outputSpeech`. This
 * will wrap the ssml in the `<speak>` tag and create the 
 * 
 */
export class SpeechBuilder {
    /**
     *
     */
    constructor() {
        let t = this, lc = `${t.constructor.name}.ctor`;

        h.log(`t: ${JSON.stringify(t)}`, "debug", 0, lc);
        h.wrapFuncs(
            t, 
            [
                t.text.name, 
                t.ssml.name, 
                t.pause.name, 
                t.outputSpeech.name
            ]
        );
    }

    private _bits: SpeechBit[] = [];

    /**
     * Just a simple static function for fluent-style reading.
     * This just news up an instance of this class.
     */
    static adding() { return new SpeechBuilder(); }

    text(text: string): SpeechBuilder {
        let t = this;
        let bit = {
            type: SpeechBitType.text,
            value: text
        }
        t._bits.push(bit);
        return t;
    } 

    ssml(ssml: string): SpeechBuilder {
        let t = this;
        let bit = {
            type: SpeechBitType.ssml,
            value: ssml
        }
        t._bits.push(bit);
        return t;
    }

    pause(seconds: number): SpeechBuilder {
        let t = this;
        let bit = {
            type: SpeechBitType.break,
            value: seconds
        }
        t._bits.push(bit);
        return t;
    }

    outputSpeech(): ask.OutputSpeech {
        let t = this, lc = `outputSpeech`;
        let text = "", ssml = "";
        h.log(`bits: ${JSON.stringify(t._bits)}`, "debug", 0, lc);
        t._bits.forEach(bit => {
            switch (bit.type) {
                case "text":
                    text = text + " " + bit.value;
                    ssml = ssml + " " + bit.value;
                    break;
                case "ssml":
                    text = text + " " + SpeechBuilder.stripSsml(<string>bit.value);
                    ssml = ssml + " " + bit.value;
                    break;
                case "break":
                    // text doesn't change
                    ssml = ssml + `<break time=${bit.value}s'/>`
                    break;
                default:
                    throw new Error(`Unknown bit.type: ${bit.type}`)
            }
        })

        h.log(`text: ${JSON.stringify(text)}`, "debug", 0, lc);
        h.log(`ssml: ${JSON.stringify(ssml)}`, "debug", 0, lc);
        let output: ask.OutputSpeech = {
            type: ask.OutputSpeechType.SSML,
            text: text,
            ssml: ssml
        }

        h.log(`output: ${JSON.stringify(output)}`, "debug", 0, lc);

        return output;
    }


// // This is the test code I did (on jsfiddle)
// // I really need to get some unit testing going...
// function stripSsml(ssml) {
//         let stripped = 
//             ssml
//             		// Combines </p> <p> to not double para breaks
//                 .replace(/\<\/p\>[ ]*\<p\>/g, "<p>")
//                 // remove spaces after <p>,</p> tags
//                 .replace(/\<p\>[ ]/g, "<p>")
//                 .replace(/\<\/p\>[ ]/g, "</p>")
//                 // convert <p> and </p> to two new lines
//                 .replace(/\<[\/]*p\>/g, "\n\n")
//                 // Strip all remaining tags
//                 .replace(/(<([^>]*)>)/ig, "")
//                 // Replace multiple spaces with a single space
//                 .replace(/  +/g, ' ');
//         return stripped;
//     }

// let ssml = `<speak>This is some text. <p>This is in a paragraph.</p> All of this has ssml stuff <break="1s" /> yo. <p>This <phoneme alphabet="ipa" ph="pɪˈkɑːn">pecan</phoneme> tastes good!</p> <p> This is another paragraph.</p></speak>`;

// let ssmlStripped = stripSsml(ssml);

// //let ssmlStripped = 
// //  ssml.replace(/\<\/p\>\W/g, "</p>")
// //    .replace(/\<[\/]*p\>/g, "\n\n")
// //    .replace(/(<([^>]*)>)/ig, "")
// //    .replace(/  +/g, ' ');

// console.log(ssml);
// console.log(ssmlStripped);

    /**
     * Strips all tags within ssml to produce plain text.
     * @param ssml ssml to strip
     */
    static stripSsml(ssml: string): string {
        let stripped = 
            ssml
                // Combines </p> <p> to not double para breaks
                .replace(/\<\/p\>[ ]*\<p\>/g, "<p>")
                // remove spaces after <p>,</p> tags
                .replace(/\<p\>(?=[ ])/g, "<p>")
                .replace(/\<\/p\>(?=[ ])/g, "</p>")
                // convert <p> and </p> to two new lines
                .replace(/\<[\/]*p\>/g, "\n\n")
                // Strip all remaining tags
                .replace(/(<([^>]*)>)/ig, "")
                // Replace multiple spaces with a single space
                .replace(/  +/g, ' ');
        return stripped;
    }
}

export type SpeechBitType = "text" | "ssml" | "break" | "phoneme";
export const SpeechBitType = {
    "text": "text" as SpeechBitType,
    "ssml": "ssml" as SpeechBitType,
    "break": "break" as SpeechBitType,
    "phoneme": "phoneme" as SpeechBitType,
}

export interface SpeechBit {
    type: SpeechBitType,
    value: string | number;
}
