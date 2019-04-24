const User = require("./User");
const db = require("../db");
const utils = require("../utils");
const activities = require("./activities.json");
const _ = require("lodash");
module.exports = {

    getResponsesForQuestion: async (activity_id, question_number) => {
        if (utils.isNull(activity_id) || utils.isNull(question_number)) {
            throw new Error("BadArguments");
        }
        const rows = await db("poll_response")
        .count("*")
        .where({
            activity_id, question_number
        })
        .groupBy("response")

        return _.map(rows, (r) => parseInt(r.count));
    },



    submitResponse: async (fb_page_id, activity_id, question_number, answerIndex) => {
        const pollActivityManifestEntry = _.find(activities.manifest, (a) => a.activity === activity_id);
        if (utils.isNull(pollActivityManifestEntry) || utils.isNull(activities[activity_id])) {
            throw new Error("InvalidActivityId");
        }
        const pollActivity = activities[activity_id];
        if (question_number < 0 || question_number >= pollActivity.length) {
            throw new Error("NoSuchQuestion");
        }
        const pollActivityQuestion = pollActivity[question_number];
        if (answerIndex < 0 || answerIndex >= pollActivityQuestion.choices.length
            || utils.isNull(pollActivityQuestion.choices[answerIndex])) {
            throw new Error("NoSuchChoice");
        }

        const existingResponse = await db("poll_response").select("*").where({
            fb_page_id, activity_id, question_number
        });

        if (existingResponse.length > 0) {
            throw new Error("AlreadySumbitted");
        }

        try {
            const submittedResponse = await db("poll_response").insert({
                fb_page_id, activity_id, question_number, response: answerIndex
            });
            if (utils.isNonNull(submittedResponse) && submittedResponse.rowCount > 0) {
                return true;
            } else {
                return false;
            }
        } catch (err) {
            throw new Error(err.message || "InternalError");
        }
    },


    completed: async (pageId) => {
        const pollActivitiesCompleted = await db("poll_response")
        .select('activity_id')
        .distinct('activity_id')
        .where({
            fb_page_id: pageId
        });
        return _.map(pollActivitiesCompleted, (p) => p.activity_id);
    }

}
