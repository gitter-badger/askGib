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

/**
 * Imports helper that has logging, among other things.
 */
import * as help from './helper';
let h = new help.Helper();

/** Helper interface. I'm not really sure if this is absolutely necessary in architecture, but it was how the demo was set up. In the future, I may remove this little classlet. */
export interface SpeechletResponseOptions {
    session: ask.Session,
    output: ask.OutputSpeech,
    shouldEndSession: boolean,
    repromptSpeech?: ask.OutputSpeech,
    cardTitle?: string,
    cardContent?: string
}

export class ResponseHelper {
    constructor(context: ask.Context, session: ask.Session) {
        let t = this;
        t._context = context;
        t._session = session;
    };

    private _context: ask.Context;
    private _session: ask.Session;

    static buildResponseBody(
        options: SpeechletResponseOptions
    ): ask.ResponseBody {
        let lc = `ResponseHelper.buildResponseBody`;
        let alexaResponse: ask.Response = {
            // outputSpeech: Response.createSpeechObject(options.output),
            outputSpeech: options.output,
            shouldEndSession: options.shouldEndSession
        };
        if (options.repromptSpeech) {
            alexaResponse.reprompt = {
                outputSpeech: options.repromptSpeech
            };
        }
        if (options.cardTitle && options.cardContent) {
            alexaResponse.card = {
                type: ask.CardType.Simple,
                title: options.cardTitle,
                content: options.cardContent
            };
        }

        let returnResult: ask.ResponseBody = {
                version: '1.0',
                response: alexaResponse
        };

        if (options.session && options.session.attributes) {
            returnResult.sessionAttributes = options.session.attributes;
        }

        h.log(`helllllo?`, "debug", 0, lc);
        let responseAsString = JSON.stringify(returnResult);
        h.log(`response length: ${responseAsString.length}`, "debug", 0, lc);
        return returnResult;
    };

    tell({
        outputSpeech,
        repromptSpeech,
        shouldEndSession = true
    }: {
        outputSpeech: ask.OutputSpeech,
        repromptSpeech?: ask.OutputSpeech,
        shouldEndSession?: boolean
    }): void {
        let t = this;
        t._context.succeed(ResponseHelper.buildResponseBody({
            session: t._session,
            output: outputSpeech,
            repromptSpeech: repromptSpeech,
            shouldEndSession: shouldEndSession
        }));
    }


    tellWithCard({
        outputSpeech,
        repromptSpeech,
        cardTitle,
        cardContent,
        shouldEndSession = true
    }: {
        outputSpeech: ask.OutputSpeech,
        repromptSpeech?: ask.OutputSpeech,
        cardTitle: string,
        cardContent: string,
        shouldEndSession?: boolean
    }): void {
        let t = this;
        t._context.succeed(ResponseHelper.buildResponseBody({
            session: t._session,
            output: outputSpeech,
            repromptSpeech: repromptSpeech,
            cardTitle: cardTitle,
            cardContent: cardContent,
            shouldEndSession: shouldEndSession
        }));
    }

    ask(
        outputSpeech: ask.OutputSpeech, 
        repromptSpeech: ask.OutputSpeech
    ): void {
        let t = this;
        t._context.succeed(ResponseHelper.buildResponseBody({
            session: t._session,
            output: outputSpeech,
            repromptSpeech: repromptSpeech,
            shouldEndSession: false
        }));
    }

    askWithCard({
        outputSpeech,
        repromptSpeech,
        cardTitle,
        cardContent
    }: {
        outputSpeech: ask.OutputSpeech,
        repromptSpeech?: ask.OutputSpeech,
        cardTitle: string,
        cardContent: string
    }): void {
        let t = this;
        t._context.succeed(ResponseHelper.buildResponseBody({
            session: t._session,
            output: outputSpeech,
            repromptSpeech: repromptSpeech,
            cardTitle: cardTitle,
            cardContent: cardContent,
            shouldEndSession: false
        }));
    }
}

