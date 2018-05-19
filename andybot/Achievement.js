const db = require("../db");
const utils = require("../utils");
const _ = require("lodash");
const User = require("./User");


const SmartCookie = require("./achievements/SmartCookie");
const QuizWhiz = require("./achievements/QuizWhiz");
const MuseumVisits = require("./achievements/MuseumVisits");
const PollCompletion = require("./achievements/PollCompletion");
const EarlyBird = require("./achievements/EarlyBird");


const avaliableAchievements = [ SmartCookie, QuizWhiz, MuseumVisits, PollCompletion, EarlyBird ];
const tableName = "achievement";

function avaliable() {
    return _.map(avaliableAchievements, (achievement) => {
        return {
            ...achievement
        };
    });
}

function findMaxSatisfiedTier(tiers, progress) {
    let maxTier = -1000;
    const tierKeys = Object.keys(tiers);
    console.log(tierKeys);
    for (var i = 0; i < tierKeys.length; i++) {
        const tierMilestone = parseInt(tierKeys[i]);
        if (progress >= tierMilestone &&  tierMilestone > maxTier) {
            maxTier = tierMilestone;
        }
        console.log(maxTier, tierMilestone, tierKeys[i], progress);
    }
    return (maxTier !== -1000 ? maxTier : 0);
}

module.exports = {

    progress: async (pageId) => {

        const allAchievements = avaliable();
        const achievementProgressCheck = (await Promise.all(_.map(allAchievements, async (achievement) => {
            const progressForAchievement = await achievement.progress(pageId);
            return {
                ...achievement,
                progress: progressForAchievement,
            };
        })));

        console.log(achievementProgressCheck)

        // Filter out any achievements that have no progress.
        const progressForUser = _.filter(achievementProgressCheck, (achievementProgress) => achievementProgress.progress > 0);
        const grantedAchievements = await db(tableName).select("*")
            .whereIn("achievement_id", _.map(allAchievements, (a) => a.id ))
            .andWhere({ fb_page_id: pageId });

        const newAchievements = [];
        const seenAchievements = [];
        for (const achievementProgress of progressForUser) {
            const existingProgressRow = _.find(grantedAchievements, (row) =>
                row.achievement_id === achievementProgress.id);
            const maxTier = findMaxSatisfiedTier(achievementProgress.tiers, achievementProgress.progress);
            if (utils.isNonNull(existingProgressRow) && maxTier === existingProgressRow.progress) {
                seenAchievements.push(achievementProgress);
            } else if (
                utils.isNonNull(existingProgressRow) 
                && maxTier > existingProgressRow.progress 
                && utils.isNonNull(achievementProgress.tiers[String(achievementProgress.progress)])
            ) {
                await db(tableName)
                    .where({ fb_page_id: pageId, achievement_id: achievementProgress.id })
                    .update({progress: achievementProgress.progress});
                newAchievements.push(achievementProgress);
            } else if (utils.isNull(existingProgressRow) && maxTier > 0) {
                await db(tableName).insert({
                    fb_page_id: pageId,
                    achievement_id: achievementProgress.id,
                    progress: maxTier
                });
                newAchievements.push(achievementProgress);
            }
        }

        const totalAchievementReward = _.reduce(
            _.map(_.filter(_.map(newAchievements, (ach) => ach.tiers[ach.progress]), utils.isNonNull), (tier) => tier.reward )
            , (x, y) => x + y, 0);

        if (totalAchievementReward > 0) {
            await User.grantPoints(pageId, totalAchievementReward);
        }

        return {
            new: newAchievements,
            seen: seenAchievements,
            reward: totalAchievementReward
        };
    }
}


// import db from "../db";

// import errors from "./errors";

// import SmartCookie from "./achievements/SmartCookie";

// import * as _ from "lodash";

// import { isNonNull, isNull } from "../utils";

// import { User } from "../user/User";

// const avaliableAchievements = [ SmartCookie ];

// export interface AchievementTier {
//     displayName: string;
//     description: string;
//     image: string;
//     reward?: string[] | string;
// }

// export interface AchivementDefinition {
//     id: string;
//     displayName: string;
//     description: string;
//     image: string;
//     thumbnail: string;
//     maxProgress: number;
//     progress: (pageId: string) => Promise<number>;
//     tiers: { [key: number]: AchievementTier };
// }

// // tslint:disable-next-line:no-namespace
// export namespace Achievement {

//     const tableName = "achievement";

//     export function avaliable() {
//         return _.map(avaliableAchievements, (achievement) => {
//             return {
//                 ...achievement
//             };
//         });
//     }

//     export async function progress(pageId: string): Promise<any> {

//         const allAchievements = avaliable();

//         const achievementProgressCheck = (await Promise.all(_.map(allAchievements, async (achievement) => {
//             const progressForAchievement = await achievement.progress(pageId);
//             return {
//                 ...achievement,
//                 progress: progressForAchievement,
//             };
//         })));

//         // tslint:disable-next-line:max-line-length
//         const progressForUser = _.filter(achievementProgressCheck, (achievementProgress) => achievementProgress.progress > 0);
//         const grantedAchievements = await db(tableName).select("*")
//             .whereIn("achievement_id", _.map(allAchievements, (a) => a.id ))
//             .andWhere({ fb_page_id: pageId, seen: false });

//         const newAchievements = [];
//         const seenAchievements = [];
//         for (const achievementProgress of progressForUser) {
//             const existingProgressRow = _.find(grantedAchievements, (row) =>
//                 row.achievement_id === grantedAchievements.id);

//             if (isNonNull(existingProgressRow) && achievementProgress.progress === existingProgressRow.progress) {
//                 seenAchievements.push(achievementProgress);
//             } else if (isNonNull(existingProgressRow) && achievementProgress.progress > existingProgressRow.progress) {
//                 await db(tableName)
//                     .where({ fb_page_id: pageId, achievement_id: achievementProgress.id })
//                     .update({progress: achievementProgress.progress});
//                 newAchievements.push(achievementProgress);
//             } else if (isNull(existingProgressRow)) {
//                 await db(tableName).insert({
//                     fb_page_id: pageId,
//                     achievement_id: achievementProgress.id,
//                     progress: achievementProgress.progress
//                 });
//                 newAchievements.push(achievementProgress);
//             }
//         }

//         const totalAchievementReward = _.reduce(
//             _.map(_.filter(_.map(newAchievements, (ach) => ach.tiers[ach.progress]), isNonNull), (tier) => tier.reward )
//             , (x, y) => x + y, 0);

//         if (totalAchievementReward > 0) {
//             await User.grantPoints(pageId, totalAchievementReward);
//         }

//         return {
//             new: newAchievements,
//             seen: seenAchievements
//         };
//     }

//     export async function markSeen(pageId: string, achievementId: string): Promise<boolean> {
//         const allAchievements = avaliable();
//         const achievement = _.find(allAchievements, (ach) => ach.id === achievementId);
//         let progressForAchievement;
//         try {
//             progressForAchievement = await achievement.progress(pageId);
//         } catch {
//             throw new Error(errors.InternalError);
//         }

//         if (progressForAchievement <= 0) {
//             throw new Error(errors.AchievementLocked);
//         }
//         try {
//             await db(tableName).insert({
//                 fb_page_id: pageId,
//                 achievement_id: achievementId,
//                 tier: progressForAchievement
//             });
//             return true;
//         } catch {
//             throw new Error(errors.InternalError);
//         }
//     }
// }
