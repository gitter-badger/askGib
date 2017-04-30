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
            h.logPriority = 1; // verbose logging by default
        };
        h.gib(t, f, /*args*/ null, lc);
    }

    _appId: string;
    /**
     * The current request.
     * 
     * Note: It is assumed that this runs in Amazon Lambda, so this 
     *   class is created every time. Otherwise, this would become
     *   mutable state. I actually pass around these values most
     *   of the time, but found I didn't want to add them to the 
     *   FuncyAlexaSkill transform handling.
     */
    request: ask.AlexaRequest;
    /**
     * The current session.
     * 
     * Note: It is assumed that this runs in Amazon Lambda, so this 
     *   class is created every time. Otherwise, this would become
     *   mutable state. I actually pass around these values most
     *   of the time, but found I didn't want to add them to the 
     *   FuncyAlexaSkill transform handling.
     */
    session: ask.Session;
    /**
     * The current response.
     * 
     * Note: It is assumed that this runs in Amazon Lambda, so this 
     *   class is created every time. Otherwise, this would become
     *   mutable state. I actually pass around these values most
     *   of the time, but found I didn't want to add them to the 
     *   FuncyAlexaSkill transform handling.
     */
    response: ResponseHelper;

    requestHandlers: RequestHandlers = {
        LaunchRequest: this.handleLaunchRequest,
        IntentRequest: this.handleIntentRequest,
        SessionEndedRequest: this.handleSessionEndedRequest
    };

    handleLaunchRequest(
        event: ask.RequestBody, 
        context: ask.Context, 
        response: ResponseHelper
    ): void {
        let t = this, lc = `AlexaSkill.handleLaunchRequest`;
        let f = () => {
            h.log(`event: ${JSON.stringify(event)}, context: ${JSON.stringify(context)}`, "info", /*priority*/ 1, lc);

            t.request = event.request;
            t.session = event.session;
            t.response = response;

            // I could call t.handleLaunch directly...should I? Hrmm...
            this.eventHandlers.onLaunch.call(t, t.request, t.session, response);
        }
        h.gib(t, f, /*args*/ null, lc);
    }

    handleIntentRequest(
        event: ask.RequestBody, 
        context: ask.Context, 
        response: ResponseHelper
    ): void {
        let t = this, lc = `AlexaSkill.handleIntentRequest`;
        let f = () => {
            h.log(`event: ${JSON.stringify(event)}, context: ${JSON.stringify(context)}`, "info", /*priority*/ 1, lc);
            t.request = event.request;
            t.session = event.session;
            t.response = response;
            // I could call t.handleIntent directly...should I? Hrmm...
            this.eventHandlers.onIntent.call(t, t.request, t.session, response);
        };
        h.gib(t, f, /*args*/ null, lc);
    }

    handleSessionEndedRequest(
        event: ask.RequestBody, 
        context: ask.Context
    ): void {
        let t = this, lc = `AlexaSkill.handleSessionEndedRequest`;
        let f = () => {
            h.log(
                `event: ${JSON.stringify(event)}\ncontext: ${JSON.stringify(context)}`, 
                "info", 
                /*priority*/ 1,
                lc
            );
            t.request = event.request;
            t.session = event.session;
            t.eventHandlers.onSessionEnded(t.request, t.session);
            context.succeed();
        };
        h.gib(t, f, /*args*/ null, lc);
    }

    /**
     * Called when the session starts.
     * Subclasses could have overriden this function to open any necessary resources.
     */
    handleSessionStarted(
        request: ask.AlexaRequest,
        session: ask.Session
    ): void {
        let t = this, lc = `AlexaSkill.handleSessionStarted`;
     
        h.log(`sessionId: ${session.sessionId}`, "info", /*priority*/ 1, lc);
        h.log(`requestId: ${request.requestId}`, "info", /*priority*/ 1, lc);
        t.request = request;
        t.session = session;
    }

    /**
     * Called when the user invokes the skill without specifying what they want.
     * The subclass must override this function and provide feedback to the user.
     */
    handleLaunch(
        launchRequest: ask.LaunchRequest, 
        session: ask.Session, 
        response: ResponseHelper
    ): void {
        throw "handleLaunch should be overridden by subclass";
    }

    /**
     * Called when the user specifies an intent.
     */
    handleIntent(
        request: ask.IntentRequest, 
        session: ask.Session, 
        response: ResponseHelper
    ): void {
        let t = this, lc = `AlexaSkill.handleIntent`;
        let f = () => {
            h.log(`request: ${JSON.stringify(request)}`, "info", /*priority*/ 1, lc);
            t.request = request;
            t.session = session;
            t.response = response;

            let intent = request.intent,
                intentName = request.intent.name,
                intentHandler = t.intentHandlers[intentName];
            if (intentHandler) {
                h.log(`intentName: ${intentName}`, "info", /*priority*/ 0, lc);
                intentHandler.call(t, intent, session, response);
            } else {
                throw `Unsupported intent: ${intentName}`;
            }
        }
        h.gib(t, f, /*args*/ null, lc);
    }
    
    /**
     * Called when the user ends the session.
     * Subclasses could have overriden this function to close any open resources.
     */
    handleSessionEnded(
        request: ask.SessionEndedRequest, 
        session: ask.Session
    ): void {
        let t = this, lc = `AlexaSkill.handleSessionEnded`;
        h.log(`sessionEndedRequest: ${JSON.stringify(request)}`, "info", /*priority*/ 1, lc);
        t.request = request;
        t.session = session;
    }

    /**
     * These handlers are very similar to Request handlers.
     * You get the incoming request, and they pretty much map to 
     * an event handler.
     * 
     */
    eventHandlers: EventHandlers = {
        onSessionStarted: this.handleSessionStarted,
        onLaunch:         this.handleLaunch,
        onIntent:         this.handleIntent,
        onSessionEnded:   this.handleSessionEnded
    };

    /**
     * When an ask.IntentRequest comes in, `handleIntent` is called. 
     * That function looks up a corresponding key in this property per
     * the intent's name. It then calls that intent handler function, 
     * passing in the intent, session, and response.
     * 
     * Subclasses should override the intentHandlers with the functions to handle specific intents.
     */
    intentHandlers: IntentHandlers = {};

    execute(
        event: ask.RequestBody, 
        context: ask.Context
    ): void {
        let t = this, lc = `AlexaSkill.execute`;
        let f = () => {
            h.log(`session applicationId: ${event.session.application.applicationId}`, "info", /*priority*/ 2, lc);

            // Validate that this request originated from authorized source.
            if (this._appId && event.session.application.applicationId !== this._appId) {
                let emsg = `Invalid applicationId: ${event.session.application.applicationId}`;
                throw emsg;
            }

            if (!event.session.attributes) {
                event.session.attributes = {};
            }

            if (event.session.new) {
                t.eventHandlers.onSessionStarted(event.request, event.session);
            }

            // Route the request to the proper handler which may have been overriden.
            var requestHandler = this.requestHandlers[event.request.type];
            h.log(`event.request.type: ${event.request.type}`, "debug", 0, lc);
            if (requestHandler) {
                requestHandler.call(this, event, context, new ResponseHelper(context, event.session));
            } else {
                h.log(`requestHandler is falsy.`, "error", 0, lc);
            }
        }
        h.gib(t, f, 
              /*args*/ null, 
              lc, 
              /*catchFn*/ (e) => context.fail(e))
    }
}

export interface EventHandlers {
    [key: string]: (request: ask.AlexaRequest,
                    session: ask.Session, 
                    response?: ResponseHelper) => void
}
/**
 * See AlexaSkill.intentHandlers
 */
export interface IntentHandlers {
    [key: string]: (intent: ask.Intent, 
                    session: ask.Session, 
                    response: ResponseHelper) => void
}

export interface RequestHandlers {
    [key: string]: (event: ask.RequestBody, 
                    context: ask.Context, 
                    response?: ResponseHelper) => void
}

export class ResponseHelper {
    constructor(context: ask.Context, session: ask.Session) {
        this._context = context;
        this._session = session;
    };

    private _context: ask.Context;
    private _session: ask.Session;

    static buildResponseBody(
        options: ISpeechletResponseOptions
    ): ask.ResponseBody {
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
        this._context.succeed(ResponseHelper.buildResponseBody({
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
        this._context.succeed(ResponseHelper.buildResponseBody({
            session: this._session,
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
        this._context.succeed(ResponseHelper.buildResponseBody({
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
        this._context.succeed(ResponseHelper.buildResponseBody({
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