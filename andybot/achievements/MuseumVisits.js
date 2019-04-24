const Stamp = require("../Stamp");
const _ = require("lodash");

const MuseumVisits = {
    id: "museumvisits",
    displayName: "Museum Enthusiast",
    description: "How often do you visit the museum?",
    image: "achievement-museum-visits.png",
    reward: 0,
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
};

module.exports = MuseumVisits;
