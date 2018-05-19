const Trivia = require("../Trivia");

const SmartCookie = {
    id: "smart-cookie",
    displayName: "Smart Cookie",
    description: "Do you think you have what it takes to ace every trivia set?",
    image: "achievement-smart-cookie.png",
    splash_image: "andy-smart-cookie.png",
    maxProgress: 1,
    progress: async (pageId) => {
        const acedSets = await Trivia.numberOfAcedTriviaSetsForUser(pageId);
        return Math.min(acedSets, 1);
    },
    tiers: {
        1: {
            displayName: "Smart Cookie",
            description: "Get over 90% on a quiz",
            reward: 10
        }
    }
};

module.exports = SmartCookie;
