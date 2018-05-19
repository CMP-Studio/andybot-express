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

        const currentTimeStamp = new Date();
        if (existingScanRows.length === 0) {
            await db(tableName).insert({
                fb_page_id: pageId,
                stamp_id: stampId,
                count: 1,
                created_at: currentTimeStamp,
                updated_at: currentTimeStamp
            });
        } else {
            // Make sure the last checkin was longer thatn 24 hours ago.

            // Make sure you can scan multiple times
            if (requestedStamp.multiple === false) {
                throw new Error("ScanLimitReached");
            }

            const lastCheckin = new Date(existingScanRows[0].updated_at).getTime();
            const now = currentTimeStamp.getTime();
            const oneDayMs = 24 * 60 * 60 * 1000;
            const oneMinMs = 60 * 1000;
            const timeLimit = process.env.NODE_ENV === 'development' ? oneMinMs : oneDayMs;
            if (now - lastCheckin < timeLimit) {
                throw new Error("DailyLimitReached");
            }

            const newScanNum = existingScanRows[0].count + 1;
            await db(tableName).update({ count: newScanNum, updated_at: currentTimeStamp }).where({
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
};
