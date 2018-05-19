const User = require("../User");


const EarlyBird = {
    id: "earlybird",
    displayName: "Early Bird",
    description: "Check in to a museum before 12:00 PM",
    image: "stamp-checkin-oakland.png",
    splash_image: "andy-quiz-wiz.png",
    maxProgress: 1,
    progress: async (pageId) => {
        const user = await User.get(pageId);
        if (user.state === undefined || user.state === null) {
            return 0;
        } else {
            if (user.state && user.state.last_scan_timestamp) {
                console.log(user.state);
                const scanTimeHours = (new Date(user.state.last_scan_timestamp)).getUTCHours();
                console.log("SCAN HOURS", scanTimeHours);
                // Must Check in before 12:00 EDT, which is 16:00 UTC
                const earlyBirdLimit = 16
                if (scanTimeHours < earlyBirdLimit) {
                    return 1;
                } else {
                    return 0;
                }  
            }
        }
        return 0;
    },
    tiers: {
        1: {
            displayName: "Early Bird",
            description: "Check in to a museum before 12 PM",
            reward: 30
        }
    }
};

module.exports = EarlyBird;
