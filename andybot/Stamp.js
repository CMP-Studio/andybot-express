const db = require("../db");
const tableName = "stamp";
const _ = require("lodash");
const stamps = require("./activities.json").stamps;
const utils = require("../utils");
module.exports = {


    grant: async (pageId, stampId) => {
        const requestedStamp = _.find(stamps, (s) => s.stamp_id === stampId);
        if (utils.isNull(requestedStamp)) {
            throw new Error("NoSuchStamp");
        }

        const existingScanRows = await db(tableName).select("*").where({
            fb_page_id: pageId, stamp_id: stampId
        });

        if (existingScanRows.length === 0) {
            await db(tableName).insert({
                fb_page_id: pageId,
                stamp_id: stampId,
                count: 1
            });
        } else {
            // Make sure the last checkin was longer thatn 24 hours ago.
            const lastCheckin = new Date(existingScanRows[0].updated_at).getTime();
            const now = (new Date()).getTime();
            const oneDayMs = 24 * 60 * 60 * 1000;
            if (now - lastCheckin < oneDayMs) {
                throw new Error("DailyLimitReached");
            }

            // Make sure you can scan multiple times
            if (requestedStamp.multiple === false) {
                throw new Error("ScanLimitReached");
            }

            const newScanNum = existingScanRows[0].count + 1;
            await db(tableName).update({ count: newScanNum }).where({
                fb_page_id: pageId, stamp_id: stampId
            });
        }
        return true;
    },

    collection: async (pageId)=> {
        const existingScanRows = await db(tableName).select("*").where({
            fb_page_id: pageId
        });
        return existingScanRows;
    }
}


// import db from "../db";
// import errors from "./errors";
// import * as _ from "lodash";
// import {isNull} from "../utils";

// const stamps = require("../activities.json").stamps;
// export namespace Stamp {

//     const tableName = "stamp";

//     export async function grant(pageId: string, stampId: string): Promise<boolean> {
//         const requestedStamp = _.find(stamps, (s) => s.stamp_id === stampId);
//         if (isNull(requestedStamp)) {
//             throw new Error(errors.NoSuchStamp);
//         }

//         const existingScanRows = await db(tableName).select("*").where({
//             fb_page_id: pageId, stamp_id: stampId
//         });

//         if (existingScanRows.length === 0) {
//             await db(tableName).insert({
//                 fb_page_id: pageId,
//                 stamp_id: stampId,
//                 count: 1
//             });
//         } else {
//             // Make sure the last checkin was longer thatn 24 hours ago.
//             const lastCheckin = new Date(existingScanRows[0].updated_at).getTime();
//             const now = (new Date()).getTime();
//             const oneDayMs = 24 * 60 * 60 * 1000;
//             if (now - lastCheckin < oneDayMs) {
//                 throw new Error(errors.DailyLimitReached);
//             }

//             // Make sure you can scan multiple times
//             if (requestedStamp.multiple === false) {
//                 throw new Error(errors.ScanLimitReached);
//             }

//             const newScanNum = existingScanRows[0].count + 1;
//             await db(tableName).update({ count: newScanNum }).where({
//                 fb_page_id: pageId, stamp_id: stampId
//             });
//         }
//         return true;
//     }

//     export async function collection(pageId: string): Promise<string[]> {
//         const existingScanRows = await db(tableName).select("*").where({
//             fb_page_id: pageId
//         });
//         return existingScanRows;
//     }

//     export async function avaliable() { return stamps; }

// }
