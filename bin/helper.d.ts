export declare type LogType = 'debug' | 'info' | 'warn' | 'error';
export declare const LogType: {
    debug: LogType;
    info: LogType;
    warn: LogType;
    error: LogType;
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
    log(msg: string, type: LogType, priority: number, context?: string): void;
    logFuncStart(lc: string, addlMsg?: string): any;
    logFuncComplete(lc: string, addlMsg?: string): any;
    logFuncCompleteAsync(lc: string, addlMsg?: string): any;
    logFuncAsyncAllDone(lc: string, addlMsg?: string): any;
    logError(errName: string, error: any, lc: string, priority?: number, addlMsg?: string): any;
    logPriority: number;
    generateUUID(): string;
    getFormattedDate(dateNumber: number, formatType?: string, withTime?: boolean, sep?: string): string;
    randomLetters(howMany: number): string;
    locationId: string;
    currentUserId: string;
    currentDeviceId: string;
}
export declare class Helper implements IHelper {
    /**Errors are always logged regardless of priority.
     *
     * @param msg The msg to log.
     * @param type error, info, debug, warn.
     * @param priority 0=silly-ish, 1= verbose-ish, 2=normal-ish, 3=terse-ish, etc.
     * @param context */
    log(msg: string, type: LogType, priority: number, context?: string): void;
    logFuncStart(lc: string, addlMsg?: string): void;
    logFuncComplete(lc: string, addlMsg?: string): void;
    logFuncCompleteAsync(lc: string, addlMsg?: string): void;
    logFuncAsyncAllDone(lc: string, addlMsg?: string): void;
    /**Wrapper for this.log for most common error logging that I seem to be doing.
     *
     * @example logError('errFunc', errFunc, lc);
     */
    logError(errName: string, error: any, lc: string, priority?: number, addlMsg?: string): void;
    readonly MSG_FUNC_START: string;
    readonly MSG_FUNC_COMP: string;
    readonly MSG_FUNC_COMP_ASYNC: string;
    readonly MSG_FUNC_COMP_ASYNC_ALLDONE: string;
    logPriority: number;
    generateUUID(): string;
    getFormattedDate(dateNumber: number, formatType?: string, withTime?: boolean, sep?: string): string;
    randomLetters(howMany: number): string;
    wrapSsmlSpeak(paras: string[]): string;
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
    ib(f: Function, args: any[], lc?: string, catchFn?: (e: Error) => void, finallyFn?: () => void, rethrow?: boolean, withTrace?: boolean): any;
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
    gib(f: Function, args: any[], lc?: string, catchFn?: (e: Error) => void, finallyFn?: () => void, rethrow?: boolean, withTrace?: boolean): any;
    locationId: string;
    currentUserId: string;
    currentDeviceId: string;
}
