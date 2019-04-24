const db = require("../db");
const utils = require("../utils");
const _ = require("lodash");
const User = require("./User");


const SmartCookie = require("./achievements/SmartCookie");
const QuizWhiz = require("./achievements/QuizWhiz");
const MuseumVisits = require("./achievements/MuseumVisits");
const PollCompletion = require("./achievements/PollCompletion");
const EarlyBird = require("./achievements/EarlyBird");
const Hunt = require("./achievements/ScavengerHunt");


const avaliableAchievements = [ QuizWhiz, SmartCookie, PollCompletion, Hunt, MuseumVisits, EarlyBird ];
const tableName = "achievement";

function avaliable() {
    return _.map(avaliableAchievements, (achievement) => {
        return {
            ...achievement
        };
    });
}


module.exports = {

    progress: async (pageId) => {

        const allAchievements = avaliable();
        const achievementProgressCheck = await Promise.all(_.map(allAchievements, async (achievement) => {
            const progressForAchievement = await achievement.progress(pageId);
            return {
                ...achievement,
                progress: progressForAchievement,
            };
        }));

        const totalAchievementReward = _.reduce(_.map(achievementProgressCheck, (ach) => ach.progress * ach.reward), (x, y) => x + y, 0);

        //if (totalAchievementReward > 0) {
        //    await User.grantPoints(pageId, totalAchievementReward);
        // }

        return {
            progressForUser: achievementProgressCheck,
            points: totalAchievementReward
        };
    }
}