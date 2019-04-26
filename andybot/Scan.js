let codes;
if (process.env.NODE_ENV === 'development') {
    codes = require("../messenger-codes-dev/manifest.json");
} else {
    codes = require("../messenger-codes/manifest.json");
}

const utils = require("../utils");
const Stamp = require("./Stamp");
const User = require("./User");
const activities = require("./activities.json");

const ScavengerHunt = require("./ScavengerHunt");

const _ = require("lodash");

function isStampCode(code) {
    // Basically these plus the other special ones
    const stampCodes = _.map(activities.stamps, (s) => s.stamp_id);
    console.log(stampCodes);
    return stampCodes.indexOf(code) > -1;
}

function isScavengerHuntCode(code) {
    var splitCode = code.split("-"); // scavengerhunt-1
    if (code.indexOf("scavengerhunt") > -1) {
        var hunt = activities["scavengerhunt"];
        if (splitCode[1] <= hunt.length) { return true; }
    }
    return false;
}

module.exports = {
    scanCode: async (pageId, code) => {
        console.log("EXpress code:");
        console.log(code);
        const user = await User.get(pageId);

        if (utils.isNonNull(code)) {
            let stamp;
            let scavengerhunt;
            let activity;


            // 2. Grant stamp. Set user location.
            if (isStampCode(code)) {
                try {
                    stamp = await Stamp.grant(pageId, code);
                    return { code, type: "stamp", stamp };
                } catch (err) {
                    stamp = { error: err.message };
                    return { code, type: "stamp", stamp };
                }
            }

            // 3. Check for scavenger hunt scan
            if (isScavengerHuntCode(code)) {
                console.log("IS SCAVENGER HUNT CODE");
                // Scavenger hunt code urls should be sacvengerhunt-clue#
                var splitCode = code.split("-");
                try {
                    scavengerhunt = await ScavengerHunt.clueFound(pageId, splitCode[1]);
                    return { code, type: "scavengerhunt", scavengerhunt };
                } catch (err) {
                    scavengerhunt = { error: err.message };
                    return { code, type: "scavengerhunt", scavengerhunt };
                }
            }

            return { code, type: code };

        }
        return null;

    }
}

