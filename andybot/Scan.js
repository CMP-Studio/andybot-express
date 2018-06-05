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
    const stampCodes = _.map(activities.stamps, (s) => s.messenger_code);
    return stampCodes.indexOf(code.ref) > -1;
}

function isScavengerHuntCode(code) {
    return code.ref.indexOf('scavengerhunt') > -1;
}

function getScanLocation(scannedCode) {
    const scan = _.find(activities.scan, (s) => s.messenger_code === scannedCode.ref)
    return utils.isNonNull(scan) ? scan : null;
}


module.exports = {
    scanCode: async (pageId, code) => {
        const user = await User.get(pageId);
        const scannedCode = codes[String(code)];
        if (utils.isNonNull(scannedCode)) {
            let stamp;
            let scavengerhunt;
            let activity;


            // 1. Do a location. Set location.
            const scan = getScanLocation(scannedCode);
            if (utils.isNonNull(scan)) {
                await User.setState(pageId, {
                    location: scan.location,
                    last_scan_timestamp: (new Date()).getTime()
                });
            }

            // 2. Grant stamp if necessary. Set user location.
            if (isStampCode(scannedCode)) {
                try {
                    stamp = await Stamp.grant(pageId, scannedCode.ref);
                    return { code: scannedCode, stamp, scan };
                } catch (err) {
                    stamp = { error: err.message };
                    return { code: scannedCode, stamp, scan };
                }
            }

            // 3. Check for scavenger hunt scan
            if (isScavengerHuntCode(scannedCode)) {
                try {
                    scavengerhunt = await ScavengerHunt.clueFound(pageId, scan);
                    return { code: scannedCode, scavengerhunt, scan };
                } catch (err) {
                    scavengerhunt = { error: err.message };
                    return { code: scannedCode, scavengerhunt, scan };
                }
            }

        }
        return null;

    }
}

