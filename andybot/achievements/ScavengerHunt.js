const ScavengerHunt = require("../ScavengerHunt");
const _ = require("lodash");

const numItems = ScavengerHunt.numClues();

const Hunt = {
    id: "poll-completion",
    displayName: "Good Eye",
    description: "Ready, Set, Search! How many clues will you solve?",
    image: "achievement-hunt.png",
    splash_image: "andy-good-eye.png",
    reward: 10,
    maxProgress: numItems,
    progress: async (pageId) => {
        const found = 0; // need to have method like --> items = await ScavengerHunt.found(pageId);
        return found.length;
    },
};

module.exports = Hunt;