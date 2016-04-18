/**
 * This is a TypeScript version started with the Space Geek template by Amazon. They use
 * Apache 2.0 license. I use MIT.
 *
 * The interfaces that I'm documenting are (ATOW 2016/04/01) from
 * https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/alexa-skills-kit-interface-reference
 *
 * The apache 2.0 note from Amazon is as follows:
 */
/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

        http://aws.amazon.com/apache2.0/

    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/
import * as ask from './alexa-skills-kit';
/**  */
export declare class AlexaSkill {
    constructor(appId: string);
    _appId: string;
    requestHandlers: any;
    eventHandlers: any;
    /**
     * Subclasses should override the intentHandlers with the functions to handle specific intents.
     */
    intentHandlers: any;
    execute(event: ask.RequestBody, context: ask.Context): void;
}
export declare class ResponseClass {
    constructor(context: ask.Context, session: ask.Session);
    _context: ask.Context;
    _session: ask.Session;
    static buildResponseBody(options: ISpeechletResponseOptions): ask.ResponseBody;
    tell({outputSpeech, repromptSpeech, shouldEndSession}: {
        outputSpeech: ask.OutputSpeech;
        repromptSpeech?: ask.OutputSpeech;
        shouldEndSession?: boolean;
    }): void;
    tellWithCard({outputSpeech, repromptSpeech, cardTitle, cardContent, shouldEndSession}: {
        outputSpeech: ask.OutputSpeech;
        repromptSpeech?: ask.OutputSpeech;
        cardTitle: string;
        cardContent: string;
        shouldEndSession?: boolean;
    }): void;
    ask(outputSpeech: ask.OutputSpeech, repromptSpeech: ask.OutputSpeech): void;
    askWithCard({outputSpeech, repromptSpeech, cardTitle, cardContent}: {
        outputSpeech: ask.OutputSpeech;
        repromptSpeech?: ask.OutputSpeech;
        cardTitle: string;
        cardContent: string;
    }): void;
}
/** Helper interface. I'm not really sure if this is absolutely necessary in architecture, but it was how the demo was set up. In the future, I may remove this little classlet. */
export interface ISpeechletResponseOptions {
    session: ask.Session;
    output: ask.OutputSpeech;
    shouldEndSession: boolean;
    repromptSpeech?: ask.OutputSpeech;
    cardTitle?: string;
    cardContent?: string;
}
