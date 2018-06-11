const Trivia = require("../Trivia");
const activities = require('../activities.json');
const _ = require("lodash");

const numActivities = _.filter(Object.keys(activities), (s) => s.indexOf('trivia') > -1).length;

const QuizWhiz = {
    id: "quizwhiz",
    displayName: "Quiz Wiz",
    description: "Can you answer every question?",
    image: "achievement-quiz-wiz.png",
    splash_image: "andy-quiz-wiz.png",
    reward: 10,
    maxProgress: numActivities,
    progress: async (pageId) => {
        const completedSets = await Trivia.completed(pageId);
        return Math.min(completedSets.length, numActivities);
    },

};

module.exports = QuizWhiz;
