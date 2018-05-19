const Stamp = require("../Stamp");
const _ = require("lodash");

const tiers = {
    1: {
        displayName: "Museum Friend",
        description: "Visit and check in at least 1 museum",
        reward: 10
    },

    5: {
        displayName: "Museum Enthusiast",
        description: "Visit the Carnegie museums 5 times",
        reward: 50
    },

    10: {
        displayName: "Museum Afficionado",
        description: "Visit the Carnegie museums 10 times",
        reward: 100
    }
}

const MuseumVisits = {
    id: "museumvisits",
    displayName: "Museum Visits",
    description: "How often do you visit the museum?",
    image: "stamp-checkin-oakland.png",
    splash_image: "andy-quiz-wiz.png",
    maxProgress: 10,
    progress: async (pageId) => {
        const collectedStamps = await Stamp.collection(pageId);
        const numCheckInStampsCollected = _.sum(
            _.map(
                _.filter(collectedStamps, (s) => s.stamp_id.indexOf("checkin") > -1),
                (checkinstamp) => checkinstamp.count
            )
        );
        return numCheckInStampsCollected;
    },
    tiers: tiers
};

module.exports = MuseumVisits;
