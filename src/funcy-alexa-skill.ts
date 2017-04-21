import { AlexaSkill, ResponseHelper } from './alexa-skill';
import * as ask from './alexa-skills-kit';

/**
 * Imports helper that has logging, among other things.
 */
import * as help from './helper';
let h = new help.Helper();

'use strict';


/**
 * AlexaSkill that uses a functional-style approach for changing
 * states. 
 * 
 * The idea is that you have a starting SkillState. Then you
 * get an incoming stimulus (from the user), which produces the 
 * next SkillState. SkillStates are seen as immutable before
 * and after the skill produces them, but during execution the 
 * SkillState may be mutated. (Implementation detail)
 * 
 * It is almost a finite state machine, but I don't want
 * the rigor of having to map transitions from one state to the 
 * next. I _think_ an FSM could actually be built on top of this,
 * i.e. via a descending class.
 * 
 * So to use this thing, you do everything the same as with the base
 * `AlexaSkill` class, with the difference of the intent handlers.
 */
export class FuncyAlexaSkill extends AlexaSkill {
    /**
     * This overrides the base class's handleIntent in order to wrap
     * intents and use the funcy skill state mechanism.
     * The `intentHandlers` property is no longer used.
     */
    handleIntentOrLaunchRequest(
        request: (ask.IntentRequest | ask.LaunchRequest), 
        session: ask.Session, 
        response: ResponseHelper
    ): void {
        let t = this, lc = `AlexaSkill.handleIntentOrLaunchRequest`;
        let f = () => {
            h.log(`request: ${JSON.stringify(request)}`, "info", /*priority*/ 1, lc);

            let intent: ask.Intent, 
                name: string,
                transforms: SkillTransform[],
                stimulus: Stimulus;
            if (isIntentRequest(request)) {
                intent = request.intent;
                name = intent.name;
                stimulus = {
                    name: name,
                    origin: "user",
                    intent: intent
                };
                transforms = t.transformsByName[name];
            } else {
                intent = null;
                name = t.getLaunchRequestName();
                stimulus = {
                    name: name,
                    origin: "user",
                    launchRequest: request
                };
                transforms = t.transformsByName[name];
            } 

            session.attributes.history = 
                session.attributes.history || [];
            let history: SkillState[] = session.attributes.history;

            if (transforms) {
                h.log(`name: ${name}`, "info", /*priority*/ 0, lc);
                // Iterate through the transforms. The one that 
                // applies to the given stimulus and history will
                // return the next, non-null SkillState. Those that 
                // do not apply will return null.
                let nextSkillState = transforms.reduce(
                    (skillTransform, resultState) => 
                        resultState ? 
                        resultState : 
                        skillTransform.call(t, 
                                            stimulus,
                                            history), 
                    null
                );
                if (nextSkillState) {
                    history.push(nextSkillState);
                    session.attributes.history = history;
                    t.respond(nextSkillState.interaction, response);
                } else {
                    throw `nextSkillState wasn't produced. No applicable SkillTransform?\nstimulus: ${JSON.stringify(stimulus)}\nhistory: ${JSON.stringify(history)}`;
                }
            } else {
                throw `Unknown intentName: ${name}`;
            }
        }
        h.gib(f, /*args*/ null, lc);
    }

    /**
     */
    handleIntent(
        request: ask.IntentRequest, 
        session: ask.Session, 
        response: ResponseHelper
    ): void {
        let t = this;
        t.handleIntentOrLaunchRequest(request, session, response);
    }

    /**
     */
    handleLaunch(
        request: ask.LaunchRequest, 
        session: ask.Session, 
        response: ResponseHelper
    ): void {
        let t = this;
        t.handleIntentOrLaunchRequest(request, session, response);
    }

    /**
     * The name is usually the intent name, however transforms can also
     * be stored/triggered via other things like a LaunchRequest.
     * 
     * The launch request name is retrieved via `getLaunchRequestName`. 
     * Override this if you want a different name used.
     */
    transformsByName: TransformsByName = {};

    getLaunchRequestName() { return "WelcomeIntent"; }

    /**
     * By default, this examines the interaction and does the 
     * appropriate call on the response helper object.
     * 
     * @param interaction The interaction that we're responding with.
     * @param response The response helper that we're going to use to trigger the response.
     */
    respond(
        interaction: Interaction, 
        response: ResponseHelper
    ): void {
        let t = this, lc = `FuncyAlexaSkill.respond`;
        let f = () => {
            let cardTitle = interaction.cardTitle;
            if (interaction.type === "tell" && cardTitle) {
                response.tellWithCard({ 
                    outputSpeech: interaction.output, 
                    repromptSpeech: interaction.reprompt, 
                    cardTitle: `Bible Seeds and Such Help`, 
                    cardContent: interaction.cardContent,
                    shouldEndSession: true
                });
            } else if (interaction.type === "ask" && cardTitle) {
                response.askWithCard({ 
                    outputSpeech: interaction.output, 
                    repromptSpeech: interaction.reprompt, 
                    cardTitle: `Bible Seeds and Such Help`, 
                    cardContent: interaction.cardContent
                });
            } else if (interaction.type === "tell") {
                // tell, no card
                response.tell({
                    outputSpeech: interaction.output,
                    repromptSpeech: interaction.reprompt,
                    shouldEndSession: true
                });
            } else {
                // ask, no card
                response.ask(interaction.output, interaction.reprompt);
            }
        }
        h.gib(f, /*args*/ null, lc);
    }
}

/**
 * A launch request will require a welcome request often, so this user
 * defined guard is used above. This is so we can share the transform
 * architecture without absolutely requiring that we're working from
 * within an IntentRequest.
 * 
 * @param request incoming request
 */
function isIntentRequest(request: ask.IntentRequest | ask.LaunchRequest): request is ask.IntentRequest {
    return (<ask.IntentRequest>request).intent !== undefined;
}
/**
 * Transform
 */
export interface TransformsByName {
    [key: string]: SkillTransform[]
}

/**
 * If a SkillTransform handles the stimulus + prevSkillState, then this 
 * will return a non-null SkillState. If it does not handle it, e.g. if
 * the func does not apply to those args, then it returns null.
 */
export type SkillTransform = { 
    (stimulus: Stimulus, history: SkillState[]): SkillState | null;
}

/**
 * The idea is that each interaction in an SkillState is an immutable 
 * thing. I'm just feeling this at right now.
 */
export interface SkillState {
    /**
     * UUID
     */
    id: string,
    /**
     * Finite state machine-ish location.
     */
    location: string,
    /**
     * Contains the output, reprompt speech, card info for actual
     * interaction with the user.
     */
    interaction: Interaction,
    /**
     * Meant to be a dictionary storage for other state, like session 
     * id e.g.
     */
    context: any,
}

/**
 * Interaction is either asking, which waits for a response, or telling,
 * which doesn't.
 */
export type InteractionType = 'ask' | 'tell';
export const InteractionType = {
    ask: 'ask' as InteractionType,
    tell: 'tell' as InteractionType
};

/**
 * This contains information about what came in (from a user) and what
 * we returned, e.g. output speech, card info, etc.
 * 
 * This interface may be expanded in the future (but of course not
 * reduced!)
 */
export interface Interaction {
    stimulus: Stimulus,
    /**
     * Are we asking or telling the user something?
     */
    type: InteractionType,
    output: ask.OutputSpeech,
    reprompt: ask.OutputSpeech,
    cardTitle?: string,
    cardContent?: string
}

/**
 * Adds a layer of indirection around an Intent.
 * (I'm just not sure of the sustainability of the Intent 
 * structure overall.)
 */
export interface Stimulus {
    name: string,
    origin: StimulusOrigin,
    intent?: ask.Intent,
    launchRequest?: ask.LaunchRequest
}

export type StimulusOrigin = "user"
export const StimulusOrigin = {
    user: 'user' as StimulusOrigin
}
