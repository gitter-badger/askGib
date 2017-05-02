import * as aws from 'aws-sdk';

/**
 * Imports helper that has logging, among other things.
 */
import * as help from './helper';
let h = new help.Helper();

export interface DynamoRecord {
    UserId: string,
    SessionAttributes: string
}

/**
 * Simple class that stores data in DynamoDB table in the 
 * given UserId's document.
 * 
 * This class assumes you have created the table with the given 
 * `dbTableName` and a primary partition key of "UserId" type string.
 * 
 * All it's going to do is 
 */
export class DynamoDbHelper {
    _db: aws.DynamoDB;

    /**
     * News up a class, but still need to call init.
     */
    constructor(
        readonly dbTableName: string, 
        readonly userId: string,
        readonly maxJsonBytes: number = 1024000
    ) { }

    /**
     */
    init({
        dbTableName,
        userId
    }: {
        dbTableName: string,
        userId: string
    }): Promise<void> {
        let t = this, lc = `DynamoDbHelper.init`;
        
        let f = () => { return new Promise<void>((resolve, reject) => {
            try {
                if (t._db) { throw new Error(`Already initialized.`); }
                t._db = new aws.DynamoDB({ apiVersion: '2012-08-10' });

                t.tableExists()
                    .then((tableExists => {
                        if (tableExists) {
                            resolve();
                        } else {
                            reject(new Error(`table does not exist`));
                        }
                    }))
                    .catch(errTableExists => { reject(errTableExists); })
                resolve();
            } catch (errP) {
                h.logError(`errP`, errP, lc);
                reject(errP);
            }
        }); }

        return h.gib(t, f, /*args*/ null, lc);
    }

    save(sessionAttributes: any): Promise<void> {
        let t = this, lc = `DynamoDbHelper.save()`;

        let f = () => { return new Promise<void>((resolve, reject) => {
            try {
                let json = JSON.stringify(sessionAttributes);

                if (json && json.length > t.maxJsonBytes) { 
                    throw new Error(`json limit is ${t.maxJsonBytes}. Attempted: ${json.length}`) 
                };
                
                let item: DynamoRecord = {
                    UserId: t.userId,
                    SessionAttributes: sessionAttributes
                }

                let params = {
                    TableName: t.dbTableName,
                    Item: item
                }

                let client = 
                    new aws.DynamoDB.DocumentClient({ service: t._db });
                client.put(params, function(errDbPut, data) {
                    if (errDbPut) {
                        h.logError(`errDbPut`, errDbPut, lc);
                        reject(errDbPut);
                    } else {
                        h.log(`Save complete. UserId: ${item.UserId}`, 'debug', 0, lc);
                        resolve();
                    }
                });
            } catch (errP) {
                h.logError(`errP`, errP, lc);
                reject(errP);
            }
        }); }

        return h.gib(t, f, /*args*/ null, lc);
    }

    /**
     * If exists, gets the DynamoRecord (Promise) for `t.userId`.
     * If doesn't exist, returns null;
     */
    get(): Promise<string> {
        let t = this, lc = `DynamoDbHelper.get()`;

        let f = () => { return new Promise<string>((resolve, reject) => {
            try {
                let params: aws.DynamoDB.DocumentClient.GetItemInput = {
                    TableName: t.dbTableName,
                    Key: { UserId: t.userId, }
                }

                let client = 
                    new aws.DynamoDB.DocumentClient({ service: t._db });
                client.get(params, function(errDbGet, data) {
                    if (errDbGet) {
                        h.logError(`errDbGet`, errDbGet, lc);
                        reject(errDbGet);
                    } else {
                        h.log(`Get complete. UserId: ${t.userId}`, 'debug', 0, lc);
                        h.log(`data.Item: ${JSON.stringify(data.Item)}`, 'debug', 0, lc);
                        let item = 
                            data.Item ? JSON.stringify(<DynamoRecord>data.Item) : null;
                        h.log(`resolving get yo`, 'debug', 0, lc);
                        resolve(item);
                    }
                });
            } catch (errP) {
                h.logError(`errP`, errP, lc);
                reject(errP);
            }
        }); }

        return h.gib(t, f, /*args*/ null, lc);
    }


    /**
     * Checks to see if table exists. Returns Promise<boolean>.
     * 
     * @param tableName is name of table, db is DynamoDB ref
     */
    tableExists(): Promise<boolean> {
        let t = this, lc = `DynamoDB tableExists(${t.dbTableName})`;
        let f: () => Promise<boolean> = () => {
            return new Promise<boolean>((resolve, reject) => {
                try {
                    let paramsExist = { TableName: t.dbTableName };
                    t._db.describeTable(paramsExist, function(errDescribeTable, data) {
                        if (errDescribeTable) {
                            h.log(JSON.stringify(errDescribeTable, null, 2), "debug", 0, lc);
                            if (errDescribeTable.statusCode &&
                                errDescribeTable.statusCode === 400 &&
                                errDescribeTable.code && errDescribeTable.code === 'ResourceNotFoundException') {
                                // Not an error, just table doesn't exist
                                h.log(`table doesn't exist`, 'debug', 0, lc);
                                resolve(false);
                            } else {
                                // Actual error
                                h.logError(
                                    'errDescribeTable', 
                                    errDescribeTable, 
                                    lc, 
                                    /*priority*/ 2, 
                                    /*addlMsg*/ JSON.stringify(data)
                                );
                                reject(errDescribeTable);
                            }
                        } else {
                            // table exists
                            let msg = `table exists.`;
                            h.log(`db.describeTable: ${msg}`, 'debug', 0, lc);
                            resolve(true);
                        }
                    });
                
                } catch (errP) {
                    h.logError(`errP`, errP, lc);
                    reject(errP);
                }
            });
        }

        return h.gib(this, f, /*args*/ null, lc);
    }


}

// export function createTable({
//     tableName,
//     db,
//     helper
// }: {
//     tableName: string,
//     db: aws.DynamoDB,
//     helper: IHelper
// }): AsyncSubject<IResult> {
//     let lc = `createTable(${tableName})`;
//     h.logFuncStart(lc);

//     let result = new AsyncSubject<IResult>();

//     try {
//         if (!tableName) { throw new Error('tableName required'); } // refactor to _validateTableName

//         var params = {
//             TableName: tableName,
//             KeySchema: [
//                 {
//                     AttributeName: 'UserId',
//                     KeyType: 'HASH',
//                 },
//                 {
//                     AttributeName: 'ItemId',
//                     KeyType: 'RANGE',
//                 }
//             ],
//             AttributeDefinitions: [
//                 {
//                     AttributeName: 'UserId',
//                     AttributeType: 'S', // (S | N | B) for string, number, binary
//                 },
//                 {
//                     AttributeName: 'ItemId',
//                     AttributeType: 'S', // (S | N | B) for string, number, binary
//                 }
//             ],
//             ProvisionedThroughput: { // required provisioned throughput for the table
//                 ReadCapacityUnits: 1,
//                 WriteCapacityUnits: 1,
//             }
//         };
//         db.createTable(params, function(errCreateTable, data) {
//             if (!errCreateTable) {
//                 // table created
//                 let msg = `table created.`;
//                 h.log(`db.createTable: ${msg}`, 'debug', 0, lc);
//                 rxresult.setResult(result, {success: true, msg: msg });
//             } else {
//                 // table exists
//                 h.logError('errCreateTable', errCreateTable, lc, 2, /*addlMsg*/ `Data: ${JSON.stringify(data)}.`);
//                 rxresult.setAsyncError(result, errCreateTable, /*value*/data);
//             }
//         });

//     } catch (errFunc) {
//         h.logError(`errFunc`, errFunc, lc);
//         rxresult.setAsyncError(result, errFunc);
//     }

//     h.logFuncCompleteAsync(lc);

//     return result;
// }

// export function waitForTableExists({
//     tableName,
//     db,
//     helper
// }: {
//     tableName: string,
//     db: aws.DynamoDB,
//     helper: IHelper
// }): AsyncSubject<IResult> {
//     let lc = `createTable(${tableName})`;
//     h.logFuncStart(lc);

//     let result = new AsyncSubject<IResult>();
//     try {
//         if (!tableName) { throw new Error('tableName required'); } // refactor to _validateTableName

//         // Waits for tables to be come ACTIVE.
//         // Useful for waiting for table operations like CreateTable to complete.
//         var paramsWaitFor = {
//             TableName: tableName,
//         };
//         // Supports 'tableExists' and 'tableNotExists'
//         db.waitFor('tableExists', paramsWaitFor, function(errWaitFor, data) {
//             if (!errWaitFor) {
//                 // table exists
//                 let msg = `table exists.`;
//                 h.log(`db.errWaitFor: ${msg}`, 'debug', 0, lc);
//                 rxresult.setResult(result, {success: true, msg: msg });
//             } else {
//                 // error
//                 h.logError('errWaitFor', errWaitFor, lc, 2, /*addlMsg*/ `Data: ${JSON.stringify(data)}.`);
//                 rxresult.setAsyncError(result, errWaitFor, /*value*/data);
//             }
//         });

//     } catch (errFunc) {
//         h.logError(`errFunc`, errFunc, lc);
//         rxresult.setAsyncError(result, errFunc);
//     }

//     h.logFuncCompleteAsync(lc);

//     return result;
// }
