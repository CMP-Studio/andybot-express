const utils = require("../utils");
const db = require("../db");
const _ = require("lodash");
const tableName = "user";

const Stamp = require("./Stamp");
const Trivia = require("./Trivia");
const activities = require("./activities.json");

const getUser = async (pageId, fields) => {
    if (utils.isNull(pageId)) {
        throw new Error("Page ID must be defined");
    }
    const user  = await db(tableName).select([
        "fb_page_id", "email", "name", "points", "created_at", "state"
    ]).where({
        fb_page_id: pageId
    });

    const stamps = await Stamp.collection(pageId);
    return user.length > 0 ? Object.assign({}, user[0], {stamps}) : null;
}

const setState = async (pageId, state) => {
    const stateUpdated = await db(tableName).update({
        state
    }).where({
        fb_page_id: pageId
    });
    return stateUpdated;
}

module.exports = {

    exists: async (pageId) => {
        if (utils.isNull(pageId)) {
            throw new Error("Page ID must be defined");
        }
        const selectedPageId = await db(tableName).select("fb_page_id").where({
            fb_page_id: pageId
        });
        return selectedPageId.length > 0;
    },

    create: async (fb_page_id, name) => {
        if (utils.isNull(fb_page_id) || utils.isNull(name)) {
            throw new Error("Page ID and name must be defined");
        }
        const newUser  = (await db(tableName).insert({ fb_page_id, name }).returning("*"))[0];
        // Knex:warning - .returning() is not supported by sqlite3 and will not have any effect.
        // Need to fetch the user manually if the return type is a number
        if (typeof newUser === "number") {
            const selectedUser = (await db(tableName).select("*").where({ fb_page_id }))[0];
            return selectedUser;
        }
        return newUser;
    },

    get: getUser,

    setState: setState,

    avaliableActivities: async (pageId) => {
        if (utils.isNull(pageId)) {
            throw new Error("Page ID must be defined");
        }

        const user = await getUser(pageId);
        let locationActivities;
        if (utils.isNonNull(user) && 
            utils.isNonNull(user.state) &&
            utils.isNonNull(user.state.location)) {
            const threeHoursMs = 3 * 60 * 60 * 1000;
            const currTimestamp = (new Date()).getTime();
            const checkinTime = user.state.last_scan_timestamp;
            if (currTimestamp - checkinTime <= threeHoursMs) {
                locationActivities = _.filter(activities.manifest, (a) => {
                    return a.location === user.state.location;
                });
            }
        }

        result = utils.isNonNull(locationActivities) ? 
            _.uniq([ ...locationActivities, ...activities.manifest ]): 
            _.map(activities.manifest, ({ activity, image, title, subtitle, museum }) => ({
                activity, image, title, subtitle, museum, type: title.split('|')[0],
        }));

        return result;
    },
}
