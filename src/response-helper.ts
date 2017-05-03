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

import { DynamoDbHelper } from './dynamo-db-helper';

/**
 * Imports helper that has logging, among other things.
 */
import * as help from './helper';
let h = new help.Helper();

// /** Helper interface. I'm not really sure if this is absolutely necessary in architecture, but it was how the demo was set up. In the future, I may remove this little classlet. */
// export interface SpeechletResponseOptions {
//     session: ask.Session,
//     output: ask.OutputSpeech,
//     shouldEndSession: boolean,
//     repromptSpeech?: ask.OutputSpeech,
//     cardTitle?: string,
//     cardContent?: string,
//     dynamoDbTableName?: string,
//     userId?: string
// }

/**
 * Helper class to interact with the response object.
 */
export class ResponseHelper {
    /**
     * Helper class to interact with the response object.
     * 
     * @param context Alexa Context
     * @param session Alexa Session
     * @param dynamoDbTableName Optional dynamoDb table name. Should have a key of UserId: string. If set, will store the session attributes in the table instead of on the session object itself.
     */
    constructor(
        readonly context: ask.Context, 
        readonly session: ask.Session, 
        readonly dynamoDbTableName?: string,
    ) {
        // let t = this;
        // t.context = context;
        // t.session = session;
    };

    // private context: ask.Context;
    // private session: ask.Session;

    buildResponseBody({
        session,
        output,
        shouldEndSession,
        repromptSpeech,
        cardTitle,
        cardContent
    }: {
        session: ask.Session,
        output: ask.OutputSpeech,
        shouldEndSession: boolean,
        repromptSpeech?: ask.OutputSpeech,
        cardTitle?: string,
        cardContent?: string
    }): ask.ResponseBody {
        let t = this, lc = `ResponseHelper.buildResponseBody`;

        let alexaResponse: ask.Response = {
            // outputSpeech: Response.createSpeechObject(output),
            outputSpeech: output,
            shouldEndSession: shouldEndSession
        };
        if (repromptSpeech) {
            alexaResponse.reprompt = {
                outputSpeech: repromptSpeech
            };
        }
        if (cardTitle && cardContent) {
            alexaResponse.card = {
                type: ask.CardType.Simple,
                title: cardTitle,
                content: cardContent
            };
        }

        let responseBody: ask.ResponseBody = {
                version: '1.0',
                response: alexaResponse
        };

        if (session && session.attributes) {
            // duplicate so we know which session belongs to the 
            // attributes, since we may persist this to dynamodb.
            session.attributes.sessionId = session.sessionId;
            if (t.dynamoDbTableName) {
                let dynamoHelper = new DynamoDbHelper(
                    t.dynamoDbTableName, 
                    session.user.userId
                );
               dynamoHelper.save(session.attributes); 
            } else {
                responseBody.sessionAttributes = session.attributes;
            }
        }

        h.log(`helllllo?`, "debug", 0, lc);
        let responseAsString = JSON.stringify(responseBody);
        h.log(`response length: ${responseAsString.length}`, "debug", 0, lc);

        return responseBody;
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
        let response = 
        t.context.succeed(t.buildResponseBody({
            session: t.session,
            output: outputSpeech,
            // repromptSpeech: repromptSpeech,
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
        t.context.succeed(t.buildResponseBody({
            session: t.session,
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
        t.context.succeed(t.buildResponseBody({
            session: t.session,
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
        t.context.succeed(t.buildResponseBody({
            session: t.session,
            output: outputSpeech,
            repromptSpeech: repromptSpeech,
            cardTitle: cardTitle,
            cardContent: cardContent,
            shouldEndSession: false
        }));
    }
}

