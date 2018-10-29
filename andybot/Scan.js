let codes;
if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'sam') {
    codes = require("../messenger-codes-dev/manifest.json");
} else {
    codes = require("../messenger-codes/manifest.json");
}

const utils = require("../utils");
const User = require("./User");
const ScavengerHunt = require("./ScavengerHunt");

const _ = require("lodash");

module.exports = {
    scanCode: async (pageId, code) => {
        const user = await User.get(pageId);
        const scannedCode = codes[String(code)];
        console.log(scannedCode);
        if (scannedCode !== undefined && scannedCode !== null) {
            const scan = parseInt(scannedCode.ref.substring(4));
            if (utils.isNonNull(scannedCode)) {
                let scavengerhunt;
                try {
                    scavengerhunt = await ScavengerHunt.clueFound(pageId, scan);
                    return { code: scannedCode, scavengerhunt, scan };
                } catch (err) {
                    scavengerhunt = { error: err.message };
                    return { code: scannedCode, scavengerhunt, scan };
                }

                return { code: scannedCode, scan };
            }
            return null;
        } else {
            console.log("returning null");
            return {};
        }
    }
}

