import { AlexaSkill, ResponseHelper } from './alexa-skill';
import * as ask from './alexa-skills-kit';
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
export declare class FuncyAlexaSkill extends AlexaSkill {
    /**
     * This overrides the base class's handleIntent in order to wrap
     * intents and use the funcy skill state mechanism.
     * The `intentHandlers` property is no longer used.
     */
    handleIntentOrLaunchRequest(request: (ask.IntentRequest | ask.LaunchRequest), session: ask.Session, response: ResponseHelper): void;
    /**
     */
    handleIntent(request: ask.IntentRequest, session: ask.Session, response: ResponseHelper): void;
    /**
     */
    handleLaunch(request: ask.LaunchRequest, session: ask.Session, response: ResponseHelper): void;
    /**
     * The name is usually the intent name, however transforms can also
     * be stored/triggered via other things like a LaunchRequest.
     *
     * The launch request name is retrieved via `getLaunchRequestName`.
     * Override this if you want a different name used.
     */
    transformsByName: TransformsByName;
    getLaunchRequestName(): string;
    /**
     * By default, this examines the interaction and does the
     * appropriate call on the response helper object.
     *
     * @param interaction The interaction that we're responding with.
     * @param response The response helper that we're going to use to trigger the response.
     */
    respond(interaction: Interaction, response: ResponseHelper): void;
}
/**
 * Transform
 */
export interface TransformsByName {
    [key: string]: SkillTransform[];
}
/**
 * If a SkillTransform handles the stimulus + prevSkillState, then this
 * will return a non-null SkillState. If it does not handle it, e.g. if
 * the func does not apply to those args, then it returns null.
 */
export declare type SkillTransform = {
    (stimulus: Stimulus, history: SkillState[]): SkillState | null;
};
/**
 * The idea is that each interaction in an SkillState is an immutable
 * thing. I'm just feeling this at right now.
 */
export interface SkillState {
    /**
     * UUID
     */
    id: string;
    /**
     * Finite state machine-ish location.
     */
    location: string;
    /**
     * Contains the output, reprompt speech, card info for actual
     * interaction with the user.
     */
    interaction: Interaction;
    /**
     * Meant to be a dictionary storage for other state, like session
     * id e.g.
     */
    context: any;
}
/**
 * Interaction is either asking, which waits for a response, or telling,
 * which doesn't.
 */
export declare type InteractionType = 'ask' | 'tell';
export declare const InteractionType: {
    ask: InteractionType;
    tell: InteractionType;
};
/**
 * This contains information about what came in (from a user) and what
 * we returned, e.g. output speech, card info, etc.
 *
 * This interface may be expanded in the future (but of course not
 * reduced!)
 */
export interface Interaction {
    stimulus: Stimulus;
    /**
     * Are we asking or telling the user something?
     */
    type: InteractionType;
    output: ask.OutputSpeech;
    reprompt: ask.OutputSpeech;
    cardTitle?: string;
    cardContent?: string;
}
/**
 * Adds a layer of indirection around an Intent.
 * (I'm just not sure of the sustainability of the Intent
 * structure overall.)
 */
export interface Stimulus {
    name: string;
    origin: StimulusOrigin;
    intent?: ask.Intent;
    launchRequest?: ask.LaunchRequest;
}
export declare type StimulusOrigin = "user";
export declare const StimulusOrigin: {
    user: "user";
};
