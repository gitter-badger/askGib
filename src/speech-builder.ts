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
        // h.wrapFuncs(
        //     t, 
        //     [
        //         t.text.name, 
        //         t.ssml.name, 
        //         t.pause.name, 
        //         t.outputSpeech.name
        //     ]
        // );
    }

    private _bits: SpeechBit[] = [];

    /**
     * Just a simple static function for fluent-style reading.
     * This just news up an instance of this class.
     */
    static with(): SpeechBuilder { return new SpeechBuilder(); }

    text(text: string): SpeechBuilder {
        let t = this;
        let bit: SpeechBit = {
            type: "text",
            value: text + ""
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

    // appendedTo(outputSpeech: ask.OutputSpeech): SpeechBuilder {
    //     let t = this;
    //     let bit: SpeechBit = {
    //         type: SpeechBitType.existingOutputSpeech,
    //         value: outputSpeech
    //     }
    //     t._bits = [bit].concat(t._bits);
    //     return t;
    // }

    existing(outputSpeech: ask.OutputSpeech): SpeechBuilder {
        let t = this;
        let bit: SpeechBit = {
            type: SpeechBitType.existingOutputSpeech,
            value: outputSpeech
        }
        t._bits.push(bit);
        return t;
    }

    outputSpeech(): ask.OutputSpeech {
        let t = this, lc = `outputSpeech`;
        let text = "", ssml = "";
        h.log(`about to do bits...`, "debug", 0, lc);
        h.log(`bits: ${JSON.stringify(t._bits)}`, "debug", 0, lc);
        t._bits.forEach(bit => {
            if (text || ssml) {
                text = text + " ";
                ssml = ssml + " ";
            }

            h.log(`bit: ${JSON.stringify(bit)}`, "debug", 0, lc);
            switch (bit.type) {
                case "text":
                    text += bit.value;
                    ssml += bit.value;
                    break;
                case "ssml":
                    text += h.stripSsml(<string>bit.value);
                    ssml += bit.value;
                    break;
                case "break":
                    // ridic edge case, if pause before any text/ssml.
                    if (ssml === " ") { ssml = ""; } 
                    // text doesn't change
                    ssml += ssml + `<break time='${bit.value}s'/>`
                    break;
                case "existingOutputSpeech":
                        let existing = <ask.OutputSpeech>bit.value;
                        if (existing.text && existing.ssml) {
                            text += existing.text;
                            ssml += h.unwrapSsmlSpeak(existing.ssml);
                        } else if (existing.text) {
                            text += existing.text;
                            ssml += text;
                        } else { // existing ssml
                            let unwrapped = 
                                h.unwrapSsmlSpeak(existing.ssml);
                            text += h.stripSsml(unwrapped);
                            ssml += unwrapped;
                        }
                default:
                    if (bit.type === "existingOutputSpeech") {
                        let existing = <ask.OutputSpeech>bit.value;
                        if (existing.text && existing.ssml) {
                            text += existing.text;
                            ssml += h.unwrapSsmlSpeak(existing.ssml);
                        } else if (existing.text) {
                            text += existing.text;
                            ssml += text;
                        } else { // existing ssml
                            let unwrapped = 
                                h.unwrapSsmlSpeak(existing.ssml);
                            text += h.stripSsml(unwrapped);
                            ssml += unwrapped;
                        }
                    } else {
                        throw new Error(`Unknown bit.type: ${bit.type}`)
                    }
            }
        });

        h.log(`text: ${JSON.stringify(text)}`, "debug", 0, lc);
        h.log(`ssml: ${JSON.stringify(ssml)}`, "debug", 0, lc);
        let output: ask.OutputSpeech = {
            type: ask.OutputSpeechType.SSML,
            text: text,
            ssml: h.wrapSsmlSpeak([ssml])
        }

        // h.log(`output: ${JSON.stringify(output)}`, "debug", 0, lc);

        return output;
    }
}

// export type SpeechBuildOp = "new" | "append" | "prepend";
// /**
//  * Determines the builder's operation "mode" for lack of a better 
//  * word. Just read the individual choice docs! :-O
//  */
// export const SpeechBuildOp = {
//     /**
//      * Creating a brand new OutputSpeech (ATOW 2017/04/27).
//      */
//     new: "new" as SpeechBuildOp,
//     /**
//      * Adding on to the end of an existing OutputSpeech. 
//      */
//     append: "append" as SpeechBuildOp,
//     /**
//      * Building on an existing OutputSpeech, but inserting _before_ 
//      * that speech's text/ssml. This is useful for adding an intro, 
//      * or prompt, etc.
//      */
//     prepend: "prepend" as SpeechBuildOp,
// }

export type SpeechBitType = 
    "text" | "ssml" | "break" | "phoneme" | "existingOutputSpeech";
export const SpeechBitType = {
    text: "text" as SpeechBitType,
    ssml: "ssml" as SpeechBitType,
    break: "break" as SpeechBitType,
    phoneme: "phoneme" as SpeechBitType,
    existingOutputSpeech: "existingOutputSpeech" as SpeechBitType,
}

export interface SpeechBit {
    type: SpeechBitType,
    value: string | number | ask.OutputSpeech
}
