# askGib
## Alexa Skills Kit

Lightweight TypeScript-ified (unofficial) Alexa Skills Kit helper library for AWS Lambda.

_NB: This is NOT an official package. Amazon has NOT given any endorsements or anything of that nature. I wanted to use TypeScript for developing Alexa Skills. Read on for further info._

## Quick Rundown

* [alexa-skills-kit.ts](https://github.com/ibgib/askGib/blob/master/alexa-skills-kit.ts)
  * TypeScript typings for the [Alexa Skills Kit JSON Interface Reference for Custom Skills](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/alexa-skills-kit-interface-reference).
  * Includes almost everything in that JSON API, including adding JSDoc documentation for all items, including Response, Session, Intent, LaunchRequest, etc.
* [`AlexaSkill`](https://github.com/ibgib/askGib/blob/master/alexa-skill.ts)
  * Base class that contains basic plumbing for an Alexa Skill.
  * Includes optional DynamoDB persistence of user information.
    * Response size is limited to 24 Kb. If you need more, you'll need some kind of storage.
    * See `DynamoRecord` interface in [](https://github.com/ibgib/askGib/blob/master/dynamo-db-helper.ts).
  * I started with the [AlexaSkill from the Space Geek](https://github.com/amzn/alexa-skills-kit-js/blob/master/samples/spaceGeek/src/AlexaSkill.js) demo code. They are licensing with Apache 2.0. Please visit [their license](http://aws.amazon.com/apache2.0/) for more information.
  * Since the initial conversion, I have adapted it to TypeScript, locked down much of it with typings, and added functionality. So far it seems to be working pretty darn well.
* [`FuncyAlexaSkill`](https://github.com/ibgib/askGib/blob/master/funcy-alexa-skill.ts)
  * `AlexaSkill` descendant which produces an immutable(ish) `SkillState` based on incoming stimulus.
  * Automatically persists each `SkillState` in `history` in `session.attributes`. 
  * The deriving class implements "transform" functions which examine the stimulus and history. If it applies, then it creates the next `SkillState`. Otherwise it returns null.
    * This allows for organization of handling states and data, similar to a finite state machine, but without the unnecessary rigidity of that paradigm.
* [`SpeechBuilder`](https://github.com/ibgib/askGib/blob/master/speech-builder.ts)
  * Helper class that builds up `OutputSpeech` objects with a fluent manner.
  * Functions include `text`, `ssml`, `pause`, `existing`.
    * `existing` can easily weave existing `OutputSpeech` objects with individual text and ssml bits.
* [`Helper`](https://github.com/ibgib/askGib/blob/master/helper.ts)
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
  * This class is still a WIP, as I currently create different instance for each file. 
    * It would be better to have a single service that is instantiated, but for now it works well enough for my use case.
    * Also, the tracing `ib` and `gib` functions could work better with async/promise-based functions.
* [`DynamoDBHelper`](https://github.com/ibgib/askGib/blob/master/dynamo-db-helper.ts)
  * Simplistic, promise-based helper class that saves and retrieves a user's `DynamoRecord` based on user id and db table name.
  * Assumes that you have separately created the table in DynamoDB with the given table name.

## Installation

Install with npm:

`npm install --save ask-gib`

Import ES6 style:

```typescript
/**
 * Imports the askGib library, which has AlexaSkill and Amazon Skills
 * Kit (ask) declarations, as well as a helper for logging and other 
 * utils.
 */
import * as ask from 'ask-gib';
let h = new ask.Helper();
```

## Usage

If you use the `AlexaSkill` class, you have to implement the event handlers and many other details. 

If you use the `FuncyAlexaSkill`, then your implementation is grossly simplified. You basically initialize and write transforms that take an incoming stimilus and history and produce a state.

Check out [bibleGib](https://github.com/ibgib/bibleGib) to see what I mean:

* [`BibleSeeds`](https://github.com/ibgib/bibleGib/blob/master/src/skill.ts) skill class shows you how to implement the `FuncyAlexaSkill` class.
  * Constructor takes in an app id and dynamo db table name (because I'm storing session in DynamoDB).
  * Inside the ctor, the `transformsByName` property is initialized with the intent names (or launch request) mapped to the corresponding transform arrays.
    * The order here is important, as the first transform to return a non-null `SkillState` wins (similar to pattern matching).
    * Be sure to include a transform for the bare launch request, e.g. `t.transformsByName[t.getLaunchRequestName()] = [t.transformWelcome];`
  * Inside each transform function, first you analyze the incoming stimulus (intent usually) and history. If the transform applies, then you do your thing and create the next `SkillState` which will automatically be persisted in the history until the next incoming stimulus and history. If the transform does not apply, then return null.
* [index.ts skill handler](https://github.com/ibgib/bibleGib/blob/master/src/index.ts#L37) shows how I'm creating the async lambda handler.
  * I've had some occasional funny blips with DynamoDB storage not retrieving the correct value in a timely manner. There _may_ be a race condition somewhere that I just haven't found yet, or this could be some kind of Lambda/DynamoDB thing. I'm still investigating.

## Additional Information

See the code JSDocs for more information. If you have any questions at all, don't hesitate to [create an issue](https://github.com/ibgib/askGib/issues/) and I'll be glad to do what I can to help.
