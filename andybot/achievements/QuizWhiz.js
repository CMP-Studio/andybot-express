const Trivia = require("../Trivia");
const activities = require('../activities.json');
const _ = require("lodash");

const numActivities = _.filter(Object.keys(activities), (s) => s.indexOf('trivia') > -1).length;

const tiers = {}
tiers[numActivities] = {
    displayName: "Quiz Whiz",
    description: "Complete every trivia set",
    reward: 50
}
 
const QuizWhiz = {
    id: "quizwhiz",
    displayName: "Quiz Whiz",
    description: "Can you answer every question?",
    image: "andy-quiz-wiz.png",
    splash_image: "andy-quiz-wiz.png",
    maxProgress: numActivities,
    progress: async (pageId) => {
        const completedSets = await Trivia.completed(pageId);
        return completedSets.length;
    },
    tiers: tiers
};

module.exports = QuizWhiz;
