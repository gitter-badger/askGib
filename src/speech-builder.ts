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
    }

    private _bits: SpeechBit[] = [];

    /**
     * Just a simple static function for fluent-style reading.
     * This just news up an instance of this class.
     */
    static with(): SpeechBuilder { return new SpeechBuilder(); }

    /**
     * Adds a bit of speech corresponding to bare (non-ssml/tagged) 
     * text.
     * 
     * @param text text to add to the builder
     */
    text(text: string): SpeechBuilder {
        let t = this;
        let bit: SpeechBit = {
            type: "text",
            value: text + ""
        }
        t._bits.push(bit);
        return t;
    } 

    /**
     * Adds a bit of speech corresponding to existing ssml. 
     * 
     * NOTE: This ssml should **NOT** contain a `<speak>` tag, as this 
     * is not automatically stripped. Also, if you choose 
     * `newParagraph`, ssml should **NOT** contain any hard-coded <p> 
     * tags
     * 
     * @param ssml ssml to add to the builder. See NOTE in function description.
     * @param newParagraph if true, wraps ssml in <p> tags. See NOTE in function description.
     */
    ssml(ssml: string, newParagraph: boolean = false): SpeechBuilder {
        let t = this;
        let bit = {
            type: SpeechBitType.ssml,
            value: newParagraph ? `<p>${ssml}</p>` : ssml
        }
        t._bits.push(bit);
        return t;
    }

    /**
     * Adds a pause (<break> tag) in the speech builder.
     * Equivalent to `<break='${seconds}s'/>` ATOW.
     * 
     * @param seconds amount of time to pause.
     */
    pause(seconds: number): SpeechBuilder {
        let t = this;
        let bit = {
            type: SpeechBitType.break,
            value: seconds
        }
        t._bits.push(bit);
        return t;
    }

    /**
     * Takes text and/or ssml from existing `OutputSpeech` 
     * object and adds it to the builder.
     * 
     * For example, say you already have an outputSpeech and you just 
     * want to add an intro text to it. You would create the builder,
     * add the intro text via `text` function and then call this
     * function with your existing outputSpeech.
     * 
     * @example `let outputWithIntro = ask.SpeechBuilder.with().text('Some intro text').existing(prevOutputSpeech).outputSpeech();`
     * @param outputSpeech existing `OutputSpeech` to weave into the builder. 
     */
    existing(outputSpeech: ask.OutputSpeech): SpeechBuilder {
        let t = this;
        let bit: SpeechBit = {
            type: SpeechBitType.existingOutputSpeech,
            value: outputSpeech
        }
        t._bits.push(bit);
        return t;
    }

    /**
     * Creates an `OutputSpeech` from the builder's state.
     */
    outputSpeech(): ask.OutputSpeech {
        let t = this, lc = `outputSpeech`;
        let text = "", ssml = "";
        h.log(`about to do bits...`, "debug", 0, lc);
        h.log(`bits: ${JSON.stringify(t._bits)}`, "debug", 0, lc);
        t._bits.forEach(bit => {
            h.log(`ssml: ${ssml}`, "debug", 0, lc);
            if (text || ssml) {
                text = text + " ";
                ssml = ssml + " ";
            }

            h.log(`bit: ${JSON.stringify(bit)}`, "debug", 0, lc);
            switch (bit.type) {
                case "text":
                    h.log(`text in case`, "debug", 0, lc);
                    text += bit.value;
                    ssml += bit.value;
                    break;
                case "ssml":
                    h.log(`ssml in case`, "debug", 0, lc);
                    // do these in two steps to fully strip ssml.
                    text += bit.value;
                    text = h.stripSsml(text); 
                    ssml += bit.value;
                    break;
                case "break":
                    h.log(`break in case`, "debug", 0, lc);
                    // ridic edge case, if pause before any text/ssml.
                    if (ssml === " ") { ssml = ""; } 
                    // text doesn't change
                    ssml += `<break time='${bit.value}s'/>`;
                    break;
                case "existingOutputSpeech":
                    h.log(`existing in case`, "debug", 0, lc);
                    let existing = <ask.OutputSpeech>bit.value;
                    if (existing.text && existing.ssml) {
                        h.log(`existing text and ssml`, "debug", 0, lc);
                        text += existing.text;
                        ssml += h.unwrapSsmlSpeak(existing.ssml);
                    } else if (existing.text) {
                        h.log(`existing text only`, "debug", 0, lc);
                        text += existing.text;
                        ssml += text;
                    } else { // existing ssml
                        h.log(`existing ssml only`, "debug", 0, lc);
                        let unwrapped = 
                            h.unwrapSsmlSpeak(existing.ssml);
                        // do these in two steps to fully strip ssml.
                        text += unwrapped;
                        text = h.stripSsml(text);
                        ssml += unwrapped;
                    }
                    break;
                case "phoneme": 
                    throw new Error("phoneme case not implemented");
                    // break
                default:
                    throw new Error(`Unknown bit.type: ${bit.type}`)
            }
        });

        h.log(`text: ${JSON.stringify(text)}`, "debug", 0, lc);
        h.log(`ssml: ${JSON.stringify(ssml)}`, "debug", 0, lc);
        let output: ask.OutputSpeech = {
            type: ask.OutputSpeechType.SSML,
            text: text,
            ssml: h.wrapSsmlSpeak([ssml], /*addParaTags*/ false)
        }

        // h.log(`output: ${JSON.stringify(output)}`, "debug", 0, lc);

        return output;
    }
}

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
