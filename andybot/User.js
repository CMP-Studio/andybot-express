const utils = require("../utils");
const db = require("../db");
const _ = require("lodash");
const tableName = "user";

const Stamp = require("./Stamp");
const Poll = require("./Poll");
const Trivia = require("./Trivia");
const activities = require("./activities.json");

async function completedActivities(pageId) {
    // find trivia rows
    const completedPolls = await Poll.completed(pageId);
    const completedActivities = await Trivia.completed(pageId);

    return [ ...completedPolls, ...completedActivities];
    // find poll rows

    // Return Ids
}

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

        let activitiesForUser = activities.manifest;
        // Filter completed activities
        const completed = await completedActivities(pageId);
        let incompleteActivities = _.filter(activities.manifest, (a) => completed.indexOf(a.activity) <= -1);

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
                    return a.location === user.state.location && completed.indexOf(a.activity) <= -1
                });
            }
        }

        let result =  utils.isNonNull(locationActivities) ? 
            _.uniq([ ...locationActivities, ...incompleteActivities ]): 
            _.map(incompleteActivities, ({ activity, image, title, subtitle, museum }) => ({
                activity, image, title, subtitle, museum, type: title.split('|')[0],
            }));
        

        if (result.length === 0) {
            result = utils.isNonNull(locationActivities) ? 
                _.uniq([ ...locationActivities, ...activities.manifest ]): 
                _.map(activities.manifest, ({ activity, image, title, subtitle, museum }) => ({
                    activity, image, title, subtitle, museum, type: title.split('|')[0],
            }));
        }

        return result;
    },

    grantPoints: async (pageId, amount) => {
        if (utils.isNull(pageId) || amount <= 0) {
            throw new Error("Page id must be defined and amount must be positive integer");
        }
        const result = await db(tableName).where({ fb_page_id: pageId }).increment("points", amount);
        return result;
    }

}


// import db from "../db";
// import { isNull } from "../utils";
// // tslint:disable-next-line:no-namespace

// import { Stamp } from "../stamp/Stamp";

// export namespace User {

//     const tableName = "user";

//     export async function exists(pageId: string): Promise<boolean> {
//         if (isNull(pageId)) {
//             throw new Error("Page ID must be defined");
//         }
//         const selectedPageId = await db(tableName).select("fb_page_id").where({
//             fb_page_id: pageId
//         });
//         return selectedPageId.length > 0;
//     }

//     export async function create(fb_page_id: string, name: string): Promise<{}> {
//         if (isNull(fb_page_id) || isNull(name)) {
//             throw new Error("Page ID and name must be defined");
//         }
//         const newUser  = (await db(tableName).insert({ fb_page_id, name }).returning("*"))[0];
//         // Knex:warning - .returning() is not supported by sqlite3 and will not have any effect.
//         // Need to fetch the user manually if the return type is a number
//         if (typeof newUser === "number") {
//             const selectedUser = (await db(tableName).select("*").where({ fb_page_id }))[0];
//             return selectedUser;
//         }
//         return newUser;
//     }

//     export async function get(pageId: string, fields?: string[]): Promise<{}> {
//         if (isNull(pageId)) {
//             throw new Error("Page ID must be defined");
//         }
//         const user  = await db(tableName).select([
//             "fb_page_id", "email", "name", "points", "created_at", "state"
//         ]).where({
//             fb_page_id: pageId
//         });

//         const stamps = await Stamp.collection(pageId);
//         return user.length > 0 ? Object.assign({}, user[0], {stamps}) : null;
//     }

//     export async function grantPoints(pageId: string, amount: number) {
//         if (isNull(pageId) || amount <= 0) {
//             throw new Error("Page id must be defined and amount must be positive integer");
//         }
//         const result = await db(tableName).where({ fb_page_id: pageId }).increment("points", amount);
//         return result;
//     }

//     // export async function updateEmail(pageId: string, email: string) {
//     //     throw new Error("Unimplemented");
//     // }

//     // export async function updatePhone(pageId: string, phone: string) {
//     //     throw new Error("Unimplemented");
//     // }

// }

