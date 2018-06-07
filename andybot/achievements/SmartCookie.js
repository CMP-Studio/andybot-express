const Trivia = require("../Trivia");
const activities = require('../activities.json');
const _ = require("lodash");

const numActivities = _.filter(Object.keys(activities), (s) => s.indexOf('trivia') > -1).length;

const SmartCookie = {
    id: "smart-cookie",
    displayName: "Smart Cookie",
    description: "Do you think you have what it takes to ace every trivia set?",
    image: "achievement-smart-cookie.png",
    splash_image: "andy-smart-cookie.png",
    reward: 5,
    maxProgress: numActivities,
    progress: async (pageId) => {
        const acedSets = await Trivia.numberOfAcedTriviaSetsForUser(pageId);
        return acedSets.length;
    },
};

module.exports = SmartCookie;
