const Poll = require("../Poll");
const _ = require("lodash");
 
const PollCompletion = {
    id: "poll-completion",
    displayName: "Opinionated",
    description: "Participate in the polls and tell us what you think.",
    image: "andy-quiz-wiz.png",
    splash_image: "andy-quiz-wiz.png",
    maxProgress: 10,
    progress: async (pageId) => {
        const completedSets = await Poll.completed(pageId);
        return completedSets.length;
    },
    tiers: {
        1: {
            displayName: "Opinionated",
            description: "Complete at least 1 poll",
            reward: 10
        },
        5: {
            displayName: "Contributor",
            description: "Complete at least 5 polls",
            reward: 50
        },
        10: {
            displayName: "Outspoken",
            description: "Complete 10 polls",
            reward: 100
        }
    }
};

module.exports = PollCompletion;
