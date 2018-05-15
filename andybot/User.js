const utils = require("../utils");
const db = require("../db");
const tableName = "user";
const Stamp = require("./Stamp");

module.exports = {

    exists: async (pageId) => {

        db.raw('select 1+1 as result').then(function (result) {
            console.log(result)
        });

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

    get: async (pageId, fields) => {
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
