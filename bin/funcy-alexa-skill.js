"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alexa_skill_1 = require("./alexa-skill");
/**
 * Imports helper that has logging, among other things.
 */
const help = require("./helper");
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
 */
class FuncyAlexaSkill extends alexa_skill_1.AlexaSkill {
    constructor() {
        super(...arguments);
        this.transformsByIntentName = {};
    }
    /**
     * This overrides the base class's handleIntent in order to wrap
     * intents and use the funcy skill state mechanism.
     * The `intentHandlers` property is no longer used.
     */
    handleIntent(intentRequest, session, response) {
        let t = this, lc = `AlexaSkill.handleIntent`;
        let f = () => {
            h.log(`intentRequest: ${JSON.stringify(intentRequest)}`, "info", /*priority*/ 1, lc);
            let intent = intentRequest.intent, intentName = intentRequest.intent.name, transforms = t.transformsByIntentName[intentName];
            let stimulus = {
                name: intent.name,
                origin: "user",
                intent: intent
            };
            session.attributes.history =
                session.attributes.history || [];
            let history = session.attributes.history;
            if (transforms) {
                h.log(`intentName: ${intentName}`, "info", /*priority*/ 0, lc);
                // Iterate through the transforms. The one that 
                // applies to the given stimulus and prev state will
                // return the next, non-null SkillState. Those that 
                // do not apply will return null.
                let nextSkillState = transforms.reduce((skillTransform, resultState) => resultState ?
                    resultState :
                    skillTransform.call(t, stimulus, history), null);
                if (nextSkillState) {
                    history.push(nextSkillState);
                    session.attributes.history = history;
                    t.respond(nextSkillState.interaction, response);
                }
                else {
                    throw `nextSkillState wasn't produced. No applicable SkillTransform?\nstimulus: ${JSON.stringify(stimulus)}\nhistory: ${JSON.stringify(history)}`;
                }
            }
            else {
                throw `Unknown intentName: ${intentName}`;
            }
        };
        h.gib(f, /*args*/ null, lc);
    }
    respond(interaction, response) {
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
            }
            else if (interaction.type === "ask" && cardTitle) {
                response.askWithCard({
                    outputSpeech: interaction.output,
                    repromptSpeech: interaction.reprompt,
                    cardTitle: `Bible Seeds and Such Help`,
                    cardContent: interaction.cardContent
                });
            }
            else if (interaction.type === "tell") {
                // tell, no card
                response.tell({
                    outputSpeech: interaction.output,
                    repromptSpeech: interaction.reprompt,
                    shouldEndSession: true
                });
            }
            else {
                // ask, no card
                response.ask(interaction.output, interaction.reprompt);
            }
        };
        h.gib(f, /*args*/ null, lc);
    }
}
exports.FuncyAlexaSkill = FuncyAlexaSkill;
exports.InteractionType = {
    ask: 'ask',
    tell: 'tell'
};
exports.StimulusOrigin = {
    user: 'user'
};
