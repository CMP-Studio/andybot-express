const ScavengerHunt = require("../ScavengerHunt");
const _ = require("lodash");

const Hunt = {
    id: "hunt",
    displayName: "Good Eye",
    description: "Ready, Set, Search! How many clues will you solve?",
    image: "achievement-hunt.png",
    splash_image: "andy-good-eye.png",
    reward: 10,
    maxProgress: 11,
    progress: async (pageId) => {
        const found = await ScavengerHunt.numCluesFound(pageId);
        return found;
    },
};

module.exports = Hunt;