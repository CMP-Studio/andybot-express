const codes = require("../messenger-codes/manifest.json");
const utils = require("../utils");
const Stamp = require("./Stamp");
const activities = require("./activities.json");
const _ = require("lodash");

function isStampCode(code) {
    // Basically these plus the other special ones
    const stampCodes = _.map(activities.stamps, (s) => s.stamp_id);
    return stampCodes.indexOf(code.ref) > -1;
}

function isScavengerHuntCode(code) {
    return;
}

module.exports = {
    scanCode: async (pageId, code) => {
        const scannedCode = codes[String(code)];
        if (utils.isNonNull(scannedCode)) {
            let stamp;
            let activity;
            // 1. Grant stamp if necessary. Set user location.
            if (isStampCode(scannedCode)) {
                try {
                    stamp = await Stamp.grant(pageId, scannedCode.ref);
                    return { code: scannedCode, stamp };
                } catch (err) {
                    stamp = { error: err.message };
                    return { code: scannedCode, stamp };
                }
            }

            // 1.5 Do a checkin if possible to an event. Set location.



            // 3. Check for scavenger hunt scan
            if (isScavengerHuntCode(scannedCode)) {
                return;
            }

            // 4. Return activity-trigger if necessary TODO

            return;
        }
        console.log(codes[code]);
        return null;

    }
}
// // {
// //     type: "checkin",
// //     granted: true,
// //     count: 1,
// //     location: "CMNH",
// //     event_id: "foobar"
// // }

// import { Stamp } from "../stamp/Stamp";

// import codes = require("../../messenger-codes/manifest.json");
// import { isNonNull } from "../utils";

// export namespace Scan {
//     export async function scanCode(pageId: string, code: string): Promise<any> {
//         const scannedCode = codes[String(code)];
//         if (isNonNull(scannedCode)) {
//             let stamp;
//             let activity;
//             // 1. Grant stamp if necessary. Set user location.
//             if (isStampCode(scannedCode)) {
//                 console.log("We have a stamp code");
//                 try {
//                     stamp = await Stamp.grant(pageId, scannedCode.ref);
//                     return { code: scannedCode, stamp };
//                 } catch (err) {
//                     stamp = { error: err.message };
//                     return { code: scannedCode, stamp };
//                 }
//             }

//             // 1.5 Do a checkin if possible to an event. Set location.



//             // 3. Check for scavenger hunt scan
//             if (isScavengerHuntCode(scannedCode)) {
//                 return;
//             }

//             // 4. Return activity-trigger if necessary TODO

//             return;
//         }
//         console.log(codes[code]);
//         return null;
//     }

//     function isStampCode(code) {
//         // Basically these plus the other special ones
//         const stampCodes = [
//             "stamp-checkin-oakland",
//             "stamp-checkin-csc",
//             "stamp-checkin-powdermill",
//             "stamp-checkin-warhol"
//         ];
//         return stampCodes.indexOf(code.ref) > -1;
//     }

//     function isScavengerHuntCode(code) {
//         return;
//     }
// }
