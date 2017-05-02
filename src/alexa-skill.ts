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

import { ResponseHelper } from './response-helper';
/**
 * Imports helper that has logging, among other things.
 */
import * as help from './helper';
import { DynamoDbHelper } from "./dynamo-db-helper";
let h = new help.Helper();

'use strict';


/**  */
export class AlexaSkill {
    /**
     * Creates a new instance of an AlexaSkill.
     * 
     * @param appId application id (should not be in version control)
     * @param dynamoDbTableName Optional dynamoDb table name. Should have a key of UserId: string. If set, will store the session attributes in the table instead of on the session object itself.
     */
    constructor(
        readonly appId: string,
        readonly dynamoDbTableName?: string
    ) {
        let t = this, lc = `AlexaSkill.ctor`;
        let f = () => {
            if (!appId) { throw new Error(`appId required`); }
            h.logPriority = 1; // verbose logging by default
        };
        h.gib(t, f, /*args*/ null, lc);
    }

    // appId: string;
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
            t.eventHandlers.onLaunch.call(t, t.request, t.session, response);
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
            t.eventHandlers.onIntent.call(t, t.request, t.session, response);
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

        if (t.dynamoDbTableName) {
            // check for session attributes in dynamodb
            let dynamoHelper = new DynamoDbHelper(
                t.dynamoDbTableName,
                session.user.userId
            );
            dynamoHelper.save({ sessionId: session.sessionId });
        }
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

    async execute(
        event: ask.RequestBody, 
        context: ask.Context
    ): Promise<void> {
        let t = this, lc = `AlexaSkill.execute`;
        let f = async () => {
            h.log(`session applicationId: ${event.session.application.applicationId}`, "info", /*priority*/ 2, lc);

            // Validate that this request originated from authorized source.
            if (t.appId && 
                event.session.application.applicationId !== t.appId) {
                throw `Invalid applicationId: ${event.session.application.applicationId}`;
            }

            await t.initSessionAttributes(event.session);

            if (event.session.new) {
                t.eventHandlers.onSessionStarted(event.request, event.session);
            }

            // Route the request to the proper handler which may have been overriden.
            let requestHandler = t.requestHandlers[event.request.type];
            h.log(`event.request.type: ${event.request.type}`, "debug", 0, lc);
            if (requestHandler) {
                requestHandler.call(t, event, context, new ResponseHelper(context, event.session, t.dynamoDbTableName));
            } else {
                h.log(`requestHandler is falsy.`, "error", 0, lc);
            }
        }
        await h.gib(t, f, 
                    /*args*/ null, 
                    lc, 
                    /*catchFn*/ (e) => context.fail(e))
    }

    initSessionAttributes(session: ask.Session): Promise<void> {
        let t = this, lc = `AlexaSkill.initSessionAttributes`;

        let f = () => { return new Promise(async (resolve, reject) => {
            try {
                if (session.attributes || !t.dynamoDbTableName) {
                    session.attributes = session.attributes || {};
                } else {
                    session.attributes = 
                        await t.getSessionAttributes(session);
                } 
                resolve();
            } catch (errP) {
                h.logError(`errP`, errP, lc);
                reject(errP);
            }
        }) };

        return h.gib(t, f, /*args*/ null, lc);
    }

    async getSessionAttributes(session: ask.Session): Promise<any> {
        let t = this, lc = `AlexaSkill.getSessionAttributes`;

        let f = async () => { return new Promise<any>(async (resolve, reject) => {
            try {
                // check for session attributes in dynamodb
                let helper = new DynamoDbHelper(
                    t.dynamoDbTableName,
                    session.user.userId
                );
                let record = await helper.get();

                h.log(`got record or null`, "debug", 0, lc);
                if (record) {
                    h.log(`record: ${record}`, "debug", 0, lc);
                    let sessionAttributes = 
                        JSON.parse(record).SessionAttributes;
                    if (sessionAttributes.sessionId === session.sessionId) {
                        resolve(sessionAttributes);
                    } else {
                        resolve({});
                    }
                } else {
                    h.log(`record: ${record}`, "debug", 0, lc);
                    resolve({}); // debug;
                }

            } catch (errP) {
                h.logError(`errP`, errP, lc);
                reject(errP);
            }
        }) };

        return await h.gib(t, f, /*args*/ null, lc);
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
