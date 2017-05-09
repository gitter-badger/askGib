import * as help from './helper';
let h = new help.Helper();

export class Ssml {
    /**
     * Wraps a given list of paragraph strings in `<speak>` tags, with
     * optional paragraph `<p>` tags.
     * 
     * @param paras individual paragraphs to be wrapped in <p></p> tags.
     * @param addParaTags If true, wraps individual strings in paras with `<p>` tags. Otherwise just concats.
     */
    static wrapSsmlSpeak(paras: string[], addParaTags: boolean = true): string {
        let result = 
            "<speak>" + 
            paras.reduce((agg, p) => {
                return addParaTags ? agg + "<p>" + p + "</p>" : agg + p;
            }, "") +
            "</speak>";
        return result;
    }

    /**
     * This simply replaces <speak> and </speak> tags with an empty 
     * string.
     * 
     * Use this when you want to add some text to existing ssml and 
     * then re-wrap the ssml.
     * 
     * @see {Helper.stripSsml} function.
     * 
     * @param ssml with <speak> tag around the whole thing.
     */
    static unwrapSsmlSpeak(ssml: string): string {
        return ssml.replace(/\<speak\>/g, "").replace(/\<\/speak\>/g, "");
    }

    /**
     * Strips all tags within ssml to produce plain text.
     * 
     * @see {Helper.unwrapSsmlSpeak} function.
     * 
     * @param ssml to strip
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
                .replace(/  +/g, ' ')
                .replace(/\\n\\n\\n/g, "\n\n")
                // .replace(/^\\n+/, "")
                .replace(/^\n+/, "")
                .replace(/\n+$/, "");
        return stripped;
    }

    /**
     * Wraps a given text in an ssml phoneme tag with the given
     * pronunciation and alphabet.
     * 
     * @param text Literal text that we're wrapping the phoneme tag around, e.g. "sewing".
     * @param pronunciation the phoneme itself, e.g. "soʊɪŋ"
     * @param alphabet phoneme alphabet, either "ipa" or "x-sampe" (ATOW)
     * 
     * @see {@link https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/speech-synthesis-markup-language-ssml-reference#prosody|SsmlReference}
     */
    static phoneme(
        text: string,
        pronunciation: string, 
        alphabet: "ipa" | "x-sampa" = "ipa"
    ): string{
        return `<phoneme alphabet="${alphabet}" ph="${pronunciation}">${text}</phoneme>`
    }

    /** 
     * Wraps a given text in an ssml emphasis tag.
     * 
     * e.g. <emphasis level="${level}">${text}</emphasis>`
     * 
     * @param text to wrap with the emphasis tag
     * @param level attribute in emphasis tag. Valid values "strong" | "moderate" | "reduced" = "moderate"
     * 
     * @see {@link https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/speech-synthesis-markup-language-ssml-reference#prosody|SsmlReference}
     */
    static emphasis(
        text: string,
        level: "strong" | "moderate" | "reduced" = "moderate"
    ) {
        return `<emphasis level="${level}">${text}</emphasis>`
    }

    /**
     * Wraps a given text in an ssml prosody tag with the given 
     * options of rate, pitch, and/or volume.
     * 
     * @param rate valid values ATOW "x-slow" | "slow" | "medium" | "fast" | "x-fast" | number,
     * @param pitch valid values ATOW "x-low" | "low" | "medium" | "high" | "x-high" | number,
     * @param volume valid values ATOW "silent" | "x-soft" | "soft" | "medium" | "loud" | "x-loud" | number
     * 
     * @see {@link https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/speech-synthesis-markup-language-ssml-reference#prosody|SsmlReference}
     */
    static prosody(
        text: string,
        { 
            rate, 
            pitch, 
            volume
        }: {
            rate?: ProsodyRateType,
            pitch?: ProsodyPitchType,
            volume?: ProsodyVolumeType
    }): string {
        let t = this, lc = `prosody`;
        let attrs = "";

        // adds the + to positive numbers
        let rateText = 
            rate && !isNaN(<number>rate) ?
            rate + "%" :
            rate;
        attrs += (rate ? `rate="${rateText}"` : "");
        
        let pitchText; 
        if (pitch && !isNaN(<number>pitch) && pitch > 0) {
            attrs = attrs ? attrs + " " : attrs;
            let max = 50;
            let pitchNum = <number>pitch;
            if (pitchNum > max) {
                h.log(`max: ${max}, actual: ${pitchNum}`, "warn", 2, lc);
            }
            pitchText = "+" + pitchNum + "%";
        } else if (pitch && !isNaN(<number>pitch)) {
            attrs = attrs ? attrs + " " : attrs;
            let min = -33.3;
            let pitchNum = <number>pitch;
            if (pitchNum < min) {
                h.log(`min: ${min}, actual: ${pitchNum}`, "warn", 2, lc);
            }
            pitchText = pitchNum + "%";
        } else if (pitch) {
            attrs = attrs ? attrs + " " : attrs;
            pitchText = pitch;
        } else {
            // word value or falsy
            pitchText = "";
        }
        attrs += (pitch ? `pitch="${pitchText}"` : "");

        let volumeText;
        if ((volume || volume === 0) && !isNaN(<number>volume) && volume >= 0) {
            attrs = attrs ? attrs + " " : attrs;
            let max = 4.08;
            let volumeNum = <number>volume;
            if (volumeNum > max) {
                h.log(`max: ${max}, actual: ${volumeNum}`, "warn", 2, lc);
            }
            volumeText = "+" + volumeNum + "%";
        } else if (volume && !isNaN(<number>volume)) {
            attrs = attrs ? attrs + " " : attrs;
            let min = -12;
            let volumeNum = <number>volume;
            if (volumeNum < min) {
                h.log(`min: ${min}, actual: ${volumeNum}`, "warn", 2, lc);
            }
           volumeText = volumeNum + "%";
        } else if (volume) {
            attrs = attrs ? attrs + " " : attrs;
            volumeText = volume;
        } else {
            // word value or falsy
            volumeText = "";
        }        
        attrs += (volume ? `volume="${volumeText}"` : "");

        return "<prosody " + attrs + ">" + text + "</prosody>";
    }
}

export type ProsodyRateType = 
    "x-slow" | "slow" | "medium" | "fast" | "x-fast" | number;
export type ProsodyPitchType = 
    "x-low" | "low" | "medium" | "high" | "x-high" | number;
export type ProsodyVolumeType = 
    "silent" | "x-soft" | "soft" | "medium" | "loud" | "x-loud" | number;