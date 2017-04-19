/**
 * This is a TypeScript version started with the Space Geek template by Amazon. They use
 * Apache 2.0 license. I use MIT.
 *
 * The interfaces that I'm documenting are (ATOW 2016/04/01) from
 * https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/alexa-skills-kit-interface-reference
 *
 * The apache 2.0 note from Amazon is as follows:
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

        http://aws.amazon.com/apache2.0/

    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/
const ask = require("./alexa-skills-kit");
/**
 * Imports helper that has logging, among other things.
 */
const help = require("./helper");
let h = new help.Helper();
'use strict';
/**  */
class AlexaSkill {
    constructor(appId) {
        this.requestHandlers = {
            LaunchRequest: this.handleLaunchRequest,
            IntentRequest: this.handleIntentRequest,
            SessionEndedRequest: this.handleSessionEndedRequest
        };
        this.eventHandlers = {
            onSessionStarted: this.handleSessionStarted,
            onLaunch: this.handleLaunch,
            onIntent: this.handleIntent,
            onSessionEnded: this.handleSessionEnded
        };
        let t = this, lc = `AlexaSkill.ctor`;
        let f = () => {
            if (appId) {
                t._appId = appId;
            }
            else {
                throw new Error(`appId required`);
            }
            h.logPriority = 1; // verbose logging by default
        };
        h.gib(f, /*args*/ null, lc);
    }
    handleLaunchRequest(event, context, response) {
        let t = this, lc = `AlexaSkill.handleLaunchRequest`;
        let f = () => {
            h.log(`event: ${JSON.stringify(event)}, context: ${JSON.stringify(context)}`, "info", /*priority*/ 1, lc);
            // I could call t.handleLaunch directly...should I? Hrmm...
            this.eventHandlers.onLaunch.call(this, event.request, event.session, response);
        };
        h.gib(f, /*args*/ null, lc);
    }
    handleIntentRequest(event, context, response) {
        let t = this, lc = `AlexaSkill.handleIntentRequest`;
        h.log(`event: ${JSON.stringify(event)}, context: ${JSON.stringify(context)}`, "info", /*priority*/ 1, lc);
        // I could call t.handleIntent directly...should I? Hrmm...
        this.eventHandlers.onIntent.call(this, event.request, event.session, response);
    }
    handleSessionEndedRequest(event, context) {
        let t = this, lc = `AlexaSkill.handleSessionEndedRequest`;
        let f = () => {
            h.log(`event: ${JSON.stringify(event)}\ncontext: ${JSON.stringify(context)}`, "info", 
            /*priority*/ 1, lc);
            t.eventHandlers.onSessionEnded(event.request, event.session);
            context.succeed();
        };
        h.gib(f, /*args*/ null, lc);
    }
    /**
     * Called when the session starts.
     * Subclasses could have overriden this function to open any necessary resources.
     */
    handleSessionStarted(sessionStartedRequest, // not sure which request this is
        session) {
        let t = this, lc = `AlexaSkill.handleSessionStarted`;
        h.log(`sessionStartedRequest: ${JSON.stringify(sessionStartedRequest)}`, "info", /*priority*/ 1);
    }
    /**
     * Called when the user invokes the skill without specifying what they want.
     * The subclass must override this function and provide feedback to the user.
     */
    handleLaunch(launchRequest, session, response) {
        throw "onLaunch should be overridden by subclass";
    }
    /**
     * Called when the user specifies an intent.
     */
    handleIntent(intentRequest, session, response) {
        let t = this, lc = `AlexaSkill.handleIntent`;
        let f = () => {
            h.log(`intentRequest: ${JSON.stringify(intentRequest)}`, "info", /*priority*/ 1, lc);
            let intent = intentRequest.intent, intentName = intentRequest.intent.name, intentHandler = t.intentHandlers[intentName];
            if (intentHandler) {
                h.log(`intentName: ${intentName}`, "info", /*priority*/ 0, lc);
                intentHandler.call(t, intent, session, response);
            }
            else {
                throw `Unsupported intent: ${intentName}`;
            }
        };
        h.gib(f, /*args*/ null, lc);
    }
    /**
     * Called when the user ends the session.
     * Subclasses could have overriden this function to close any open resources.
     */
    handleSessionEnded(sessionEndedRequest, session) {
        let t = this, lc = `AlexaSkill.handleSessionEnded`;
        h.log(`sessionEndedRequest: ${JSON.stringify(sessionEndedRequest)}`, "info", /*priority*/ 1, lc);
    }
    // intentHandlers: { [key: string]: (intent, session, response) => void }
    execute(event, context) {
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
        }
        catch (e) {
            console.log("Unexpected exception " + e);
            context.fail(e);
        }
    }
}
exports.AlexaSkill = AlexaSkill;
class ResponseClass {
    constructor(context, session) {
        this._context = context;
        this._session = session;
    }
    ;
    static buildResponseBody(options) {
        var alexaResponse = {
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
        var returnResult = {
            version: '1.0',
            response: alexaResponse
        };
        if (options.session && options.session.attributes) {
            returnResult.sessionAttributes = options.session.attributes;
        }
        return returnResult;
    }
    ;
    tell({ outputSpeech, repromptSpeech, shouldEndSession = true }) {
        this._context.succeed(ResponseClass.buildResponseBody({
            session: this._session,
            output: outputSpeech,
            repromptSpeech: repromptSpeech,
            shouldEndSession: shouldEndSession
        }));
    }
    tellWithCard({ outputSpeech, repromptSpeech, cardTitle, cardContent, shouldEndSession = true }) {
        this._context.succeed(ResponseClass.buildResponseBody({
            session: this._session,
            output: outputSpeech,
            repromptSpeech: repromptSpeech,
            cardTitle: cardTitle,
            cardContent: cardContent,
            shouldEndSession: shouldEndSession
        }));
    }
    ask(outputSpeech, repromptSpeech) {
        this._context.succeed(ResponseClass.buildResponseBody({
            session: this._session,
            output: outputSpeech,
            repromptSpeech: repromptSpeech,
            shouldEndSession: false
        }));
    }
    askWithCard({ outputSpeech, repromptSpeech, cardTitle, cardContent }) {
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
exports.ResponseClass = ResponseClass;
