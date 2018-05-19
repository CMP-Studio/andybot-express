// import db from "../db";

const utils = require("../utils");
const _ = require("lodash");
const db = require("../db");
const activities = require("./activities.json");

function acedTrivia (triviaActivity) {
    const state = triviaActivity;
    if (((state.correct * 1.0) / state.total) >= 0.9) {
        return true;
    } else {
        return false;
    }
}

module.exports = {

    submitScore: async (fb_page_id, activity_id, correct, total) => {

        const triviaExists = utils.isNonNull(activities[activity_id]) && activity_id.indexOf("trivia") > -1;
        if (triviaExists === false) {
            throw new Error("InvalidActivityId");
        }

        if (
            // activities[activity_id].length !== total ||
            correct > total || total < 0 || correct < 0) {
            throw new Error("BadArguments");
        }

        try {
            const insertRowIds = await db("trivia").insert({
                fb_page_id, activity_id, correct, total
            });
            return true;
        } catch (err) {
            console.error(err);
            throw new Error("InternalError");
        }
    },

    numberOfAcedTriviaSetsForUser: async (pageId) => {
        const triviaActivitiesCompleted = await db("trivia")
        .select("*")
        .where({
            fb_page_id: pageId
        });
        const acedTriviaSets = _.filter(triviaActivitiesCompleted, acedTrivia);
        return acedTriviaSets.length;
    },

    completed: async (pageId) => {
        const triviaActivitiesCompleted = await db("trivia")
        .select("activity_id")
        .distinct('activity_id')
        .where({
            fb_page_id: pageId
        });
        return _.map(triviaActivitiesCompleted, (t) => t.activity_id);
    }
}
