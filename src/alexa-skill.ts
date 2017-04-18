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

'use strict';


/**  */
export class AlexaSkill {
    constructor(appId: string) {
        let t = this, lc = `AlexaSkill.ctor`;
        let f = () => {
            if (appId) {
                t._appId = appId;
            } else { 
                throw new Error(`appId required`); 
            }
        };
        h.gib(f, /*args*/ null, lc);
    }

    _appId: string;

    requestHandlers: any = {
        LaunchRequest: this.handleLaunchRequest,
        IntentRequest: this.handleIntentRequest,
        SessionEndedRequest: this.handleSessionEndedRequest
    };

    handleLaunchRequest(
        event: ask.RequestBody, 
        context: ask.Context, 
        response: ask.Response
    ): void {
        console.log(`[AlexaSkill.LaunchRequest] event: ${JSON.stringify(event)}, context: ${JSON.stringify(context)}`);

        this.eventHandlers.onLaunch.call(this, event.request, event.session, response);
    }

    handleIntentRequest(
        event: ask.RequestBody, 
        context: ask.Context, 
        response: ask.Response
    ): void {
        console.log(`[AlexaSkill.IntentRequest] event: ${JSON.stringify(event)}, context: ${JSON.stringify(context)}`);
        this.eventHandlers.onIntent.call(this, event.request, event.session, response);
    }

    handleSessionEndedRequest(
        event: ask.RequestBody, 
        context: ask.Context
    ): void {
        console.log(`[AlexaSkill.SessionEndedRequest] event: ${JSON.stringify(event)}, context: ${JSON.stringify(context)}`);
        this.eventHandlers.onSessionEnded(event.request, event.session);
        context.succeed();
    }

    /**
     * Called when the session starts.
     * Subclasses could have overriden this function to open any necessary resources.
     */
    handleSessionStarted(
        sessionStartedRequest: any, // not sure which request this is
        session: ask.Session
    ): void {
        let t = this, lc = `AlexaSkill.handleSessionStarted`;
        h.logFuncStart(lc, `sessionStartedRequest: ${JSON.stringify(sessionStartedRequest)}`)
    }

    /**
     * Called when the user invokes the skill without specifying what they want.
     * The subclass must override this function and provide feedback to the user.
     */
    handleLaunch(
        launchRequest: ask.LaunchRequest, 
        session: ask.Session, 
        response: ResponseClass
    ): void {
        throw "onLaunch should be overridden by subclass";
    }

    eventHandlers: any = {
        onSessionStarted: this.handleSessionStarted,
        onLaunch: this.handleLaunch,

        /**
         * Called when the user specifies an intent.
         */
        onIntent: function (intentRequest: ask.IntentRequest, session: ask.Session, response: ask.Response) {
            console.log(`[AlexaSkill.onIntent] intentRequest: ${JSON.stringify(intentRequest)}`);

            var intent = intentRequest.intent,
                intentName = intentRequest.intent.name,
                intentHandler = this.intentHandlers[intentName];
            if (intentHandler) {
                console.log('dispatch intent = ' + intentName);
                intentHandler.call(this, intent, session, response);
            } else {
                throw 'Unsupported intent = ' + intentName;
            }
        },

        /**
         * Called when the user ends the session.
         * Subclasses could have overriden this function to close any open resources.
         */
        onSessionEnded: function (sessionEndedRequest: ask.SessionEndedRequest, session: ask.Session) {
            console.log(`[AlexaSkill.onSessionEnded] sessionEndedRequest: ${JSON.stringify(sessionEndedRequest)}`);
        }
    };

    /**
     * Subclasses should override the intentHandlers with the functions to handle specific intents.
     */
    intentHandlers: any = {};

    execute(event: ask.RequestBody, context: ask.Context) {
        try {
            console.log("session applicationId: " + event.session.application.applicationId);

            // Validate that this request originated from authorized source.
            if (this._appId && event.session.application.applicationId !== this._appId) {
                console.log("The applicationIds don't match : " + event.session.application.applicationId + " and "
                    + this._appId);
                throw "Invalid applicationId";
            }

            if (!event.session.attributes) {
                event.session.attributes = {};
            }

            if (event.session.new) {
                this.eventHandlers.onSessionStarted(event.request, event.session);
            }

            // Route the request to the proper handler which may have been overriden.
            var requestHandler = this.requestHandlers[event.request.type];
            requestHandler.call(this, event, context, new ResponseClass(context, event.session));
        } catch (e) {
            console.log("Unexpected exception " + e);
            context.fail(e);
        }
    }
}


export class ResponseClass {
    constructor(context: ask.Context, session: ask.Session) {
        this._context = context;
        this._session = session;
    };

    _context: ask.Context;
    _session: ask.Session;

    static buildResponseBody(options: ISpeechletResponseOptions): ask.ResponseBody {
        var alexaResponse: ask.Response = {
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

        var returnResult: ask.ResponseBody = {
                version: '1.0',
                response: alexaResponse
        };

        if (options.session && options.session.attributes) {
            returnResult.sessionAttributes = options.session.attributes;
        }

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
        this._context.succeed(ResponseClass.buildResponseBody({
            session: this._session,
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
        this._context.succeed(ResponseClass.buildResponseBody({
            session: this._session,
            output: outputSpeech,
            repromptSpeech: repromptSpeech,
            cardTitle: cardTitle,
            cardContent: cardContent,
            shouldEndSession: shouldEndSession
        }));
    }

    ask(outputSpeech: ask.OutputSpeech, repromptSpeech: ask.OutputSpeech) {
        this._context.succeed(ResponseClass.buildResponseBody({
            session: this._session,
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
        this._context.succeed(ResponseClass.buildResponseBody({
            session: this._session,
            output: outputSpeech,
            repromptSpeech: repromptSpeech,
            cardTitle: cardTitle,
            cardContent: cardContent,
            shouldEndSession: false
        }));
    }
}

/** Helper interface. I'm not really sure if this is absolutely necessary in architecture, but it was how the demo was set up. In the future, I may remove this little classlet. */
export interface ISpeechletResponseOptions {
    session: ask.Session,
    output: ask.OutputSpeech,
    shouldEndSession: boolean,
    repromptSpeech?: ask.OutputSpeech,
    cardTitle?: string,
    cardContent?: string
}