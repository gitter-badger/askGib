export type LogType = 'debug' | 'info' | 'warn' | 'error';
export const LogType = {
    debug: 'debug' as LogType,
    info: 'info' as LogType,
    warn: 'warn' as LogType,
    error: 'error' as LogType,
};

/**
 * I use IHelper (implemented with class Helper) to do logging, as well 
 * other various helper functionality: easy random letters, UUID, etc.
 *
 * I also use this for the `ib` and `gib` functions, which basically 
 * execute functions wrapped with try/catch/finally and optional 
 * logging/tracing. 
 * 
 * This is very much like a Utils or whatever else people call these.
 * 
 * To change logging verbosity, set `logPriority`. 
 */
export interface IHelper {
    // ---------------------------------------
    // Logging
    // ---------------------------------------
    log(
        msg: string,
        type: LogType,
        priority: number,
        context?: string
    ): void;

    logFuncStart(lc: string, addlMsg?: string);
    logFuncComplete(lc: string, addlMsg?: string);
    logFuncCompleteAsync(lc: string, addlMsg?: string);
    logFuncAsyncAllDone(lc: string, addlMsg?: string);
    logError(errName: string, error: any, lc: string, priority?: number, addlMsg?: string);

    logPriority: number;

    // ---------------------------------------
    // Utils
    // ---------------------------------------
    generateUUID(): string;
    getFormattedDate(dateNumber: number, formatType?: string, withTime?: boolean, sep?: string): string;
    randomLetters(howMany: number): string;

    // ---------------------------------------
    // User Identification
    // ---------------------------------------
    locationId: string;
    currentUserId: string;
    currentDeviceId: string;
}

/**
 * Implementation of {IHelper}.
 * 
 * @see {IHelper}
 */
export class Helper implements IHelper {
    // ---------------------------------------
    // Logging
    // ---------------------------------------
    /**Errors are always logged regardless of priority.
     *
     * @param msg The msg to log.
     * @param type error, info, debug, warn.
     * @param priority 0=silly-ish, 1= verbose-ish, 2=normal-ish, 3=terse-ish, etc.
     * @param context */
    log(
        msg: string,
        type: LogType,
        priority: number,
        context?: string
    ): void {
        if (priority < this.logPriority && type !== 'error') {
            return;
        }

        var timestamp = 
            this.getFormattedDate(
                /*when*/ Date.now(),
                /*month format*/ 'num',
                /*withTime*/ true,
                /*sep*/ ''
            );

        // let contextSegment = this._getChalkContextSegment(context);
        let contextSegment = `[${context}] `;
        let formattedMsg = `[${timestamp}][${type}]${contextSegment}${msg}`;

        switch (type) {
            case 'error': {
                console.error(formattedMsg);
                break;
            }
            case 'info': {
                console.info(formattedMsg);
                break;
            }
            case 'debug': {
                // console.debug throws error on node server
                // console.debug(timestamp + '[debug] ' + msg);
                // colors in javascript...thanks SO people:
                // http://stackoverflow.com/questions/7505623/colors-in-javascript-console
                // let randomColor = this._getRandomColorFromContext(context);
                // if (randomColor) {
                //     let css = `color: ${randomColor}`;
                //     console.log(`%c ${formattedMsg}`, css);
                // } else {
                    console.info(formattedMsg);
                // }
                break;
            }
            case 'warn': {
                console.warn(formattedMsg);
                break;
            }
            default: {
                console.info(formattedMsg);
                break;
            }
        }
    }

    logFuncStart(lc: string, addlMsg?: string) {
        let msg = addlMsg ? `${this.MSG_FUNC_START} ${addlMsg}` : this.MSG_FUNC_START;
        this.log(msg, 'debug', 0, lc);
    }

    logFuncComplete(lc: string, addlMsg?: string) {
        let msg = addlMsg ? `${this.MSG_FUNC_COMP} ${addlMsg}` : this.MSG_FUNC_COMP;
        this.log(msg, 'debug', 0, lc);
    }

    logFuncCompleteAsync(lc: string, addlMsg?: string) {
        let msg = addlMsg ? `${this.MSG_FUNC_COMP_ASYNC} ${addlMsg}` : this.MSG_FUNC_COMP_ASYNC;
        this.log(msg, 'debug', 0, lc);
    }

    logFuncAsyncAllDone(lc: string, addlMsg?: string) {
        let msg = addlMsg ? `${this.MSG_FUNC_COMP_ASYNC_ALLDONE} ${addlMsg}` : this.MSG_FUNC_COMP_ASYNC_ALLDONE;
        this.log(msg, 'debug', 0, lc);
    }

    /**Wrapper for this.log for most common error logging that I seem to be doing.
     *
     * @example logError('errFunc', errFunc, lc);
     */
    logError(errName: string, error: any, lc: string, priority: number = 2, addlMsg: string = null) {
        let msg = addlMsg ?
            `${addlMsg}>> ${errName}: ${error.message}` :
            `${errName}: ${error.message ? error.message : JSON.stringify(error)}`;

        this.log(msg, 'error', priority, lc);
    }


    get MSG_FUNC_START(): string { return `Starting...`; }
    get MSG_FUNC_COMP(): string { return `Complete.`; }
    get MSG_FUNC_COMP_ASYNC(): string { return `Complete. Async tasks may still be running.`; }
    get MSG_FUNC_COMP_ASYNC_ALLDONE(): string { return `Async task(s) Complete.`; }

    logPriority: number = 0;

    // ---------------------------------------
    // Utils
    // ---------------------------------------

    // /**Thanks SO!
    //  * http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript */
    generateUUID(): string {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (d + Math.random()*16)%16 | 0;
            d = Math.floor(d/16);
            return (c=='x' ? r : (r&0x3|0x8)).toString(16);
        });
        return uuid;
    }

    getFormattedDate(dateNumber: number, formatType: string = 'short', withTime: boolean = true, sep: string = ' '): string {
        var date = new Date(dateNumber);
        var result = <string>'';

        var monthNames = <string[]>[];

        switch (formatType) {
            case 'short': {
                monthNames = [
                    "Jan", "Feb", "Mar",
                    "Apr", "May", "Jun", "Jul",
                    "Aug", "Sep", "Oct",
                    "Nov", "Dec"
                ];
                break;
            }
            case 'long': {
                monthNames = [
                    "January", "February", "March",
                    "April", "May", "June", "July",
                    "August", "September", "October",
                    "November", "December"
                ];
                break;
            }
            case 'num': {
                monthNames = [
                    "1", "2", "3",
                    "4", "5", "6", "7",
                    "8", "9", "10",
                    "11", "12"
                ];
                break;
            }
            default: {
                monthNames = [
                    "1", "2", "3",
                    "4", "5", "6", "7",
                    "8", "9", "10",
                    "11", "12"
                ];
                break;
            }
        }

        var day = date.getDate();
        var month = monthNames[date.getMonth()];
        var year = date.getFullYear();

        result += year + sep + month + sep + day;

        if (withTime === true) {
            result += ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds() + '.' + date.getMilliseconds();
        }

        return result;
    }

    randomLetters(howMany: number) {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for( var i=0; i < howMany; i++ )
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }

    /**
     * Picks a random item from an array. Just a Math.floor(Math.random
     * * array.length) function.
     */
    randomItem<T>(array: Array<T>): T {
        if (!array) { throw new Error('array required'); }
        if (array.length === 0) {
            return null;
        } else {
            return array[Math.floor(Math.random() * array.length)];
        }
    }

    /**
     * Wraps a function `f` in a try/catch/(finally) block with 
     * optional tracing.
     * 
     * The `ib` function will create this function but not immediately 
     * invoke it.
     * The `gib` function will immediately invoke function `f`.
     * 
     * Often, I find myself creating closures for `f` and passing null for the args.
     * 
     * @see {gib}
     * 
     * @param f Function to execute, wrapped in try/c/f w or w/o logging
     * @param args Args to pass to function. Pass null if no args (e.g. when using a closure.)
     * @param lc Optional log context. Defaults to f.name.
     * @param catchFn Additional catch functionality to logging
     * @param finallyFn Optional `finally` statement
     * @param rethrow Rethrows any exceptions if true.
     * @param withTrace Log start/complete of f, overridden by window.ibTraceAll
     */
    ib(
        fThis: any,
        f: Function, 
        args: any[], 
        lc?: string, 
        catchFn?: (e: Error) => void, 
        finallyFn?: () => void,
        rethrow: boolean = true,
        withTrace: boolean = true
    ): any {
        let t = this, lcIb = `Helper.ibOrGib`;
        fThis = fThis || t;
        try {
            let argsString = 
                args && args.length ? 
                args.reduce((a, b) => JSON.stringify(a) + ", " + JSON.stringify(b)) : 
                '';
            if (f && f.name) {
                lc = lc || `${f.name}(${argsString})`;
            } else {
                lc = lc || lcIb;
            }
            if (!f) { throw `function f is falsy yo.`}
            
            let result;

            if (withTrace || (<any>window).ibTraceAll) {
                result = () => {
                    t.logFuncStart(lc);
                    try {
                        return f.apply(fThis, args);
                    } catch (errF) {
                        t.logError(`errF`, errF, lc);
                        if (catchFn) { catchFn(errF); }
                        if (rethrow) { throw errF; }
                    } finally {
                        if (finallyFn) { finallyFn(); }
                        t.logFuncComplete(lc);
                    }
                }
            } else {
                result = () => {
                    try {
                        return f.apply(fThis, args);
                    } catch (errF) {
                        t.logError(`errF`, errF, lc);
                        if (catchFn) { catchFn(errF); }
                        if (rethrow) { throw errF; }
                    } finally {
                        if (finallyFn) { finallyFn(); }
                    }
                }
            }
            
            Object.defineProperty(result, "name", { value: f.name });
            
            return result;

        } catch (errFunc) {
            t.logError(`errFunc`, errFunc, lc);
            if (catchFn) { catchFn(errFunc); }
            if (rethrow) { throw errFunc; }
        } finally {
            if (finallyFn) { finallyFn(); }
        }
    }

    /**
     * Wraps a function `f` in a try/catch/(finally) block with 
     * optional tracing.
     * 
     * The `ib` function will create this function but not immediately 
     * invoke it.
     * The `gib` function will immediately invoke function `f`.
     * 
     * Often, I find myself creating closures for `f` and passing null for the args.
     * 
     * @see {ib}
     * 
     * @param f Function to execute, wrapped in try/c/f w or w/o logging
     * @param args Args to pass to function. Pass null if no args (e.g. when using a closure.)
     * @param lc Optional log context. Defaults to f.name.
     * @param catchFn Additional catch functionality to logging
     * @param finallyFn Optional `finally` statement
     * @param rethrow Rethrows any exceptions if true.
     * @param withTrace Log start/complete of f, overridden by window.ibTraceAll
     */
    gib(
        fThis: any,
        f: Function, 
        args: any[], 
        lc?: string, 
        catchFn?: (e: Error) => void, 
        finallyFn?: () => void,
        rethrow: boolean = true,
        withTrace: boolean = true
    ): any {
        return this.ib(fThis, f, args, lc, catchFn, finallyFn, rethrow, withTrace).call(this);
    }

    // ibPromise<TResult>(
    //     fThis: any,
    //     f: (fResolve, fReject) => Promise<TResult>,
    //     args: any[], 
    //     lc?: string, 
    //     catchFn?: (e: Error) => void, 
    //     finallyFn?: () => void,
    //     rethrow: boolean = true,
    //     withTrace: boolean = true
    // ): Promise<TResult> {
    //     let result = new Promise<TResult>((resolve, reject) => {
    //         h.logfunc
    //     });
    //     return result;
    // }

    /**
     * Wraps the given object's functions corresponding to `funcNames` with 
     * @param obj 
     * @param funcNames 
     */
    // wrapFuncs(obj: Object, funcNames: string[]): void {
    //     let t = this;

    //     t.log("wrap funcs whaaaa", "debug", 0, "wrapFuncs huh");
    //     funcNames.forEach(funcName => {
    //         t.wrapFunc(obj, funcName);
    //     });
    // }
    // /**
    //  * I'm still playing with learning JS (and es6) stuff, so I'm 
    //  * adding functions dynamically and doing the wrapping here in 
    //  * this small builder class.
    //  * 
    //  * So this addFunc takes a function, uses its name to generate the
    //  * lc (log context), and then calls h.gib on the function. _That_
    //  * function wraps it in a try/catch with trace logging using the lc.
    //  * 
    //  * @param fn should be named with trailing Fn, so a function foo would be fooFn. Else use fnName
    //  * @param fnName 
    //  */
    // wrapFunc(obj: Object, fnName: string) {
    //     let t = this;
    //     let fn: Function = obj[fnName];
    //     if (!fn) { throw new Error(`invalid fnName: ${fnName}. Not found on object.`)}
    //     let lc = obj.constructor.name + "." + fnName;
    //     t.log(`yo wrap funnnncy`, "debug", 0, lc);
    //     obj[fnName] = t.ib(obj, fn, Array.from(arguments), lc);
    // }

    /**
     * Naive clone function that just stringifies then parses obj.
     */
    clone<T>(obj: T): T {
        return <T>JSON.parse(JSON.stringify(obj));
    }
    
    // ---------------------------------------
    // User Identification
    // (I don't think I'm using these at all.)
    // ---------------------------------------

    /** @deprecated */
    locationId: string;
    /** @deprecated */
    currentUserId: string;
    /** @deprecated */
    currentDeviceId: string;
}
