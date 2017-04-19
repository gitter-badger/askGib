"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogType = {
    debug: 'debug',
    info: 'info',
    warn: 'warn',
    error: 'error',
};
class Helper {
    constructor() {
        this.logPriority = 0;
    }
    // ---------------------------------------
    // Logging
    // ---------------------------------------
    /**Errors are always logged regardless of priority.
     *
     * @param msg The msg to log.
     * @param type error, info, debug, warn.
     * @param priority 0=silly-ish, 1= verbose-ish, 2=normal-ish, 3=terse-ish, etc.
     * @param context */
    log(msg, type, priority, context) {
        if (priority < this.logPriority && type !== 'error') {
            return;
        }
        var timestamp = this.getFormattedDate(
        /*when*/ Date.now(), 
        /*month format*/ 'num', 
        /*withTime*/ true, 
        /*sep*/ '');
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
    logFuncStart(lc, addlMsg) {
        let msg = addlMsg ? `${this.MSG_FUNC_START} ${addlMsg}` : this.MSG_FUNC_START;
        this.log(msg, 'debug', 0, lc);
    }
    logFuncComplete(lc, addlMsg) {
        let msg = addlMsg ? `${this.MSG_FUNC_COMP} ${addlMsg}` : this.MSG_FUNC_COMP;
        this.log(msg, 'debug', 0, lc);
    }
    logFuncCompleteAsync(lc, addlMsg) {
        let msg = addlMsg ? `${this.MSG_FUNC_COMP_ASYNC} ${addlMsg}` : this.MSG_FUNC_COMP_ASYNC;
        this.log(msg, 'debug', 0, lc);
    }
    logFuncAsyncAllDone(lc, addlMsg) {
        let msg = addlMsg ? `${this.MSG_FUNC_COMP_ASYNC_ALLDONE} ${addlMsg}` : this.MSG_FUNC_COMP_ASYNC_ALLDONE;
        this.log(msg, 'debug', 0, lc);
    }
    /**Wrapper for this.log for most common error logging that I seem to be doing.
     *
     * @example logError('errFunc', errFunc, lc);
     */
    logError(errName, error, lc, priority = 2, addlMsg = null) {
        let msg = addlMsg ?
            `${addlMsg}>> ${errName}: ${error.message}` :
            `${errName}: ${error.message}`;
        this.log(msg, 'error', priority, lc);
    }
    get MSG_FUNC_START() { return `Starting...`; }
    get MSG_FUNC_COMP() { return `Complete.`; }
    get MSG_FUNC_COMP_ASYNC() { return `Complete. Async tasks may still be running.`; }
    get MSG_FUNC_COMP_ASYNC_ALLDONE() { return `Async task(s) Complete.`; }
    // ---------------------------------------
    // Utils
    // ---------------------------------------
    // /**Thanks SO!
    //  * http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript */
    generateUUID() {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;
    }
    getFormattedDate(dateNumber, formatType = 'short', withTime = true, sep = ' ') {
        var date = new Date(dateNumber);
        var result = '';
        var monthNames = [];
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
    randomLetters(howMany) {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < howMany; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    }
    wrapSsmlSpeak(paras) {
        let result = "<speak>" +
            paras.reduce((agg, p) => {
                return p ? agg + "<p>" + p + "</p>" : agg;
            }, "") +
            "</speak>";
        return result;
    }
    /**
     * Wraps a function `f` in a try/catch/(finally) block with
     * optional tracing.
     *
     * The `ib` function will create this function but not immediately
     * invoke it.
     * The `gib` function will immediately invoke function `f`.
     * @param f Function to execute, wrapped in try/c/f w or w/o logging
     * @param args Args to pass to function
     * @param lc Optional log context. Defaults to f.name.
     * @param catchFn Additional catch functionality to logging
     * @param finallyFn Optional `finally` statement
     * @param rethrow Rethrows any exceptions if true.
     * @param withTrace Log start/complete of f, overridden by window.ibTraceAll
     */
    ib(f, args, lc, catchFn, finallyFn, rethrow = true, withTrace = true) {
        let argsString = args && args.length ?
            args.reduce((a, b) => JSON.stringify(a) + ", " + JSON.stringify(b)) :
            '';
        lc = lc || `${f.name}(${argsString})`;
        let result;
        let t = this;
        if (withTrace || window.ibTraceAll) {
            result = () => {
                t.logFuncStart(lc);
                try {
                    return f.apply(this, args);
                }
                catch (e) {
                    t.logError(`errFunc`, e, lc);
                    if (rethrow) {
                        throw e;
                    }
                }
                finally {
                    t.logFuncComplete(lc);
                    if (finallyFn) {
                        finallyFn();
                    }
                }
            };
        }
        else {
            result = () => {
                try {
                    return f.apply(this, args);
                }
                catch (e) {
                    console.error(`${lc} error: ${e.message}`);
                    if (catchFn) {
                        catchFn(e);
                    }
                    else if (rethrow) {
                        throw e;
                    }
                }
                finally {
                    if (finallyFn) {
                        finallyFn();
                    }
                }
            };
        }
        Object.defineProperty(result, "name", { value: f.name });
        return result;
    }
    /**
     * Wraps a function `f` in a try/catch/(finally) block
     * with optional tracing.
     * The `ib` function will create this function but not immediately
     * invoke it.
     * The `gib` function will immediately invoke function `f`.
     * @param f Function to execute, wrapped in try/c/f w or w/o logging
     * @param args Args to pass to function
     * @param lc Optional log context. Defaults to f.name.
     * @param catchFn Additional catch functionality to logging
     * @param finallyFn Optional `finally` statement
     * @param rethrow Rethrows any exceptions if true.
     * @param withTrace Log start/complete of f, overridden by window.ibTraceAll
     */
    gib(f, args, lc, catchFn, finallyFn, rethrow = true, withTrace = true) {
        this.ib(f, args, lc, catchFn, finallyFn, rethrow, withTrace).call(this);
    }
}
exports.Helper = Helper;
