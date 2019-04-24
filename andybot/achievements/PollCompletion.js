const Poll = require("../Poll");
const _ = require("lodash");

const activities = require('../activities.json');
const numActivities = _.filter(Object.keys(activities), (s) => s.indexOf('poll') > -1).length;

const PollCompletion = {
    id: "poll-completion",
    displayName: "Opinionated",
    description: "Participate in the polls and tell us what you think.",
    image: "achievement-poll.png",
    splash_image: "andy-rock-vote.png",
    reward: 5,
    maxProgress: numActivities,
    progress: async (pageId) => {
        const completedPolls = await Poll.completed(pageId);
        return Math.min(completedPolls.length, numActivities);
    },
};

module.exports = PollCompletion;
