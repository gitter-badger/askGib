# askGib
ask = Alexa Skills Kit

So this is a small helper library for ASK + TypeScript:
  * [alexa-skills-kit.ts](https://github.com/ibgib/askGib/blob/master/alexa-skills-kit.ts)
    * TypeScript typings for the [Alexa Skills Kit JSON Interface Reference for Custom Skills](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/alexa-skills-kit-interface-reference).
    * I created typings for everything in that JSON API, including adding JSDoc documentation for all items, including Response, Session, Intent, LaunchRequest, etc.
  * [alexa-skill.ts (AlexaSkill)](https://github.com/ibgib/askGib/blob/master/alexa-skill.ts)
    * I started with the [AlexaSkill from the Space Geek](https://github.com/amzn/alexa-skills-kit-js/blob/master/samples/spaceGeek/src/AlexaSkill.js) demo code. They are licensing with Apache 2.0. Please visit [their license](http://aws.amazon.com/apache2.0/) for more information.
    * Since the initial conversion, I have adapted it to TypeScript, locked down much of it with typings, and added functionality. So far it seems to be working pretty darn well.

I created these TypeScript files to use in an earlier Alexa Skill ([bibleGib](https://github.com/ibgib/bibleGib)), and I want to use them in another skill as well ([learnYourLinesYo](https://github.com/ibgib/learnYourLinesYo)). So I'm trying to create a package to be used via npm, so I can have the code in a single place.

Wish me luck.


If you have questions, comments, corrects or all that good stuff, or if you're just
reading this and want to say hello, you can give me (Bill Raiford) a holler at
ibgib@ibgib.com.