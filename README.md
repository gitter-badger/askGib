# askGib
## Alexa Skills Kit

Lightweight, TypeScript-ified, unofficial library for writing Alexa Skills on AWS Lambda.

_NB: This is NOT an official package. Amazon has NOT given any endorsements or anything of that nature. I wanted to use TypeScript for developing Alexa Skills. Read on for further info._

## Quick Rundown

* [alexa-skills-kit.ts](https://github.com/ibgib/askGib/blob/master/src/alexa-skills-kit.ts)
  * TypeScript typings for the [Alexa Skills Kit JSON Interface Reference for Custom Skills](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/alexa-skills-kit-interface-reference).
  * Includes almost everything in that JSON API, including adding JSDoc documentation for all items, including Response, Session, Intent, LaunchRequest, etc.
* [`FuncyAlexaSkill`](https://github.com/ibgib/askGib/blob/master/src/funcy-alexa-skill.ts)
  * `AlexaSkill` descendant which produces an immutable(ish) [`SkillState`](https://github.com/ibgib/askGib/blob/master/src/funcy-alexa-skill.ts#L326) based on incoming stimulus.
  * Makes it almost trivial to implement an Alexa Skill by writing [`SkillTransform`](https://github.com/ibgib/askGib/blob/master/src/funcy-alexa-skill.ts#L319) functions.
    * Your implementation class implements these functions which examine the stimulus and history. If the transform applies, then it creates the next `SkillState`. Otherwise it returns `null`.
      * e.g. Transforms for the `AMAZON.HelpIntent` could be `[helpLocationA, helpLocationB, helpDefault]`. In your transform, you would test the previous `SkillState` in history for its location. If it were location "B", then `helpLocationA` would return `null`, and `helpLocationB` would return a non-`null` `SkillState`. `helpDefault` would not be executed.
    * Plumbing is automatic.
      * Each intent (or launch request) and response (`OutputSpeech`, reprompt, card info, location, etc.) is persisted in a `SkillState`.
      * Every `SkillState` is stored in `history` in `session.attributes`. 
        * If dynamo db table name is given in ctor, session.attributes (which has only a 24 kB max) is persisted in dynamo db for the current user.
* [`AlexaSkill`](https://github.com/ibgib/askGib/blob/master/src/alexa-skill.ts)
  * Base class that contains basic plumbing for an Alexa Skill.
  * Includes optional DynamoDB persistence of user information.
    * Response size is limited to 24 Kb. If you need more, you'll need some kind of storage.
    * See [`DynamoRecord` interface](https://github.com/ibgib/askGib/blob/master/src/dynamo-db-helper.ts).
  * I started with the [AlexaSkill from the Space Geek](https://github.com/amzn/alexa-skills-kit-js/blob/master/samples/spaceGeek/src/AlexaSkill.js) demo code. They are licensing with Apache 2.0. Please visit [their license](http://aws.amazon.com/apache2.0/) for more information.
  * Since the initial conversion, I have adapted it to TypeScript, locked down much of it with typings, and added functionality. So far it seems to be working pretty darn well.
* [`SpeechBuilder`](https://github.com/ibgib/askGib/blob/master/src/speech-builder.ts)
  * Helper class that builds up `OutputSpeech` objects with a fluent manner.
  * Functions include `text`, `ssml`, `pause`, `existing`.
    * `existing` can easily weave existing [`OutputSpeech`](https://github.com/ibgib/askGib/blob/master/src/alexa-skills-kit.ts#L230) objects with individual text and ssml bits.
* [`DynamoDBHelper`](https://github.com/ibgib/askGib/blob/master/src/dynamo-db-helper.ts)
  * Simplistic, promise-based helper class that saves and retrieves a user's `DynamoRecord` based on user id and db table name.
  * Assumes that you have separately created the table in DynamoDB with the given table name.
* [`Helper`](https://github.com/ibgib/askGib/blob/master/src/helper.ts)
  * Logging helpers
  * UUID generation
  * Random helpers
  * Ssml helpers
    * Wrap/unwrap `<speak>` tags. (can't have them nested)
    * Strip ssml from text.
    * Phoneme, emphasis, and prosody tag string factory functions.
  * `ib` and `gib` functions for AOP stuff like tracing functions, wrapping in `try/catch` blocks.
    * A little experimental for trying to remove boilerplate code.
    * Used prodigiously in `FuncyAlexaSkill`.
  * This class is still a WIP, as I currently create different instances for each file. 
    * It would be better to have a single service that is instantiated, but for now it works well enough for my use case.
    * Also, the tracing `ib` and `gib` functions could work better with async/promise-based functions.

## Installation

Install with npm:

`npm install --save ask-gib`

Import ES6 style:

```typescript
import * as ask from 'ask-gib';
let h = new ask.Helper();
```

## Usage

If you use the `AlexaSkill` class, you have to implement the event handlers and many other details. 

If you use the more opinionated `FuncyAlexaSkill`, then your implementation is grossly simplified. You basically initialize and write transforms that take an incoming stimulus and history and produce a state. All of the request plumbing, with tracing, is handled for you.

Check out [bibleGib](https://github.com/ibgib/bibleGib) to see what I mean:

* [`BibleSeeds`](https://github.com/ibgib/bibleGib/blob/master/src/skill.ts) skill class shows you how to implement the `FuncyAlexaSkill` class.
  * Constructor takes in an app id and dynamo db table name (because I'm storing session in DynamoDB).
    * This does not auto-create the DynamoDB table, i.e. you have to manually create it with a single column of `UserId` type `string`.
  * Inside the [ctor](https://github.com/ibgib/bibleGib/blob/ab93a180d3e54d8e3170ec56dc2ba70ab5fa0d45/src/skill.ts#L26), the `transformsByName` property is initialized with the intent names (or launch request) mapped to the corresponding transform arrays.
    * The order here is important, as the first transform to return a non-`null` `SkillState` wins (similar to pattern matching).
    * Be sure to include a transform for the bare launch request, e.g. `t.transformsByName[t.getLaunchRequestName()] = [t.transformWelcome];`
    ```typescript
    t.transformsByName = {
        "WelcomeIntent": [t.transformWelcome],
        "AMAZON.HelpIntent": [t.transformHelpBlankOut, t.transformHelpDefault],
        "HearTheWordIntent": [t.transformHearTheWord, t.transformHelpDefault],
        "RetainTheWordIntent": [t.transformRetainTheWord, t.transformHelpDefault],
        "AnswerIntent": [t.transformAnswerWaterBlankOut, t.transformHelpDefault],
        "IDontKnowIntent": [t.transformAnswerWaterBlankOut, t.transformHelpDefault],
        "AnswerOnlyIntent": [t.transformYesIntent, t.transformAnswerWaterBlankOut, t.transformHelpDefault],
        "AMAZON.YesIntent": [t.transformYesIntent, t.transformHelpDefault],
        "AMAZON.RepeatIntent": [t.transformRepeat],
        "AMAZON.CancelIntent": [t.transformGoodbye],
        "AMAZON.StopIntent": [t.transformGoodbye],
        "ThankYouIntent": [t.transformGoodbye],
    }
    ```
  * Inside each transform function, first you analyze the incoming stimulus (intent usually) and history. If the transform applies, then you do your thing and create the next `SkillState` which will automatically be persisted in the history until the next incoming stimulus and history. If the transform does not apply, then return `null`.
    * See the [transformYesIntent](https://github.com/ibgib/bibleGib/blob/ab93a180d3e54d8e3170ec56dc2ba70ab5fa0d45/src/skill.ts#L376) as an example of this.
    ```typescript
    transformYesIntent: ask.SkillTransform = (
        stimulus: ask.Stimulus, 
        history: ask.SkillState[]
    ): ask.SkillState => {
        let t = this, lc = `transformYesIntent`;
        let f = () => {
            let prevSkillState = 
                t.getPrevSkillState(
                    history.filter(s => 
                        !s.interaction.context || 
                        !s.interaction.context.isHelp
                    )
                );
            if (
                !prevSkillState || 
                !["home", "hearing"]
                    .includes(prevSkillState.location) ||
                t.getPreviousAnswer(history) // cull AnswerOnlyIntent
            ) {
                // doesn't apply to this transform
                h.log(`skipping transform...`, "debug", 0, lc);
                return null;
            }

            if (prevSkillState.location === "home") {
                return t.transformHearTheWord(stimulus, history);
            } else if (prevSkillState.location === "hearing") {
                return t.transformRetainTheWord(stimulus, history);
            }
        }
        let fResult = h.gib(t, f, /*args*/ null, lc);

        h.log(`fResult: ${JSON.stringify(fResult)}`, "debug", 0, lc);

        return fResult;
    }
    ```
* [index.ts skill handler](https://github.com/ibgib/bibleGib/blob/master/src/index.ts#L37) shows how I'm creating the async lambda handler.
  * I've had some occasional funny blips with DynamoDB storage not retrieving the correct value in a timely manner. There _may_ be a race condition somewhere that I just haven't found yet, or this could be some kind of Lambda/DynamoDB thing. I'm still investigating.
  ```typescript
  // Create the handler that responds to the Alexa Request.
  export var handler = function (event, context, callback) {
      let lc = `index handler`;

      h.logFuncStart(lc);
      try {
          // Create an instance of the BibleSeeds skill.
          var bibleSeeds = new BibleSeeds(APP_ID, DB_NAME);

          // await bibleSeeds.execute(event, context);
          bibleSeeds.execute(event, context)
          .then(() => {
              h.log(`handler execute callback`, "debug", 0, lc);
              callback();
          })
          .catch(errYo => {
              h.logError(`errYo`, errYo, lc);
              callback();
          });

          h.logFuncComplete(lc);
      } catch (errExec) {
          h.logError(`errExec`, errExec, lc);
          // callback();
      }
  };
  ```

## Additional Information

See the code JSDocs for more information. If you have any questions at all, don't hesitate to [create an issue](https://github.com/ibgib/askGib/issues/) and I'll be glad to do what I can to help.

## Thanks

* Amazon for creating such good documentation and a good product.
* The official [Alexa Skills Kit SDK for Node.js](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs)
  * This is where I got the idea for the simple DynamoDB table persistence approach :+1: