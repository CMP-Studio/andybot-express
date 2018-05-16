const _ = require("lodash");
const google = require("googleapis").google;
const config = require("../config");
const utils = require("../utils");
const schedule = require("./activities.json").schedule;
const striptags = require('striptags');

async function getCalendarEvents() {
    let timeMin, timeMax;
    if (process.env.NODE_ENV === 'development') {
        timeMin = new Date(new Date().getTime() + (20 * 24 * 60 * 60 * 1000));
        timeMax = new Date(new Date().getTime() + (27 * 24 * 60 * 60 * 1000))
    } else {
        timeMin = new Date();
        timeMax = new Date(new Date().getTime() + (7 * 24 * 60 * 60 * 1000))
    }

    try {
        // Fetch events from google calendar
        const calendar = await google.calendar({version: "v3"}).events.list({
            auth: config.google.apiKey,
            calendarId: config.scheduleCalendarId,
            showDeleted: false,
            singleEvents: true,
            timeMin: timeMin,
            timeMax: timeMax,
        });
        return calendar.data.items;
    } catch (err) {
        console.error(err);
    }
}

async function getEventDetails(events) {
    return _.filter(_.map(events, (e) => {
        const split = striptags(e.description).match(/(ID:)(.*)$/);
        if (utils.isNull(split) || split.length < 3) {
            // tslint:disable-next-line:max-line-length
            console.warn(`Missing Event ID in calendar description for event ${e.summary} created by ${e.creator.displayName}`);
            return null;
        }

        const eventId = split[2].trim();

        console.log(schedule);

        const eventDetails = _.find(schedule, (scheduledEvent) => {
            return scheduledEvent.id === eventId;
        });

        if (utils.isNull(eventDetails)) {
            console.warn(`Missing Event details or mismatched Event ID in activities manifest for calendar event ${e.summary} created by ${e.creator.displayName}`);
            return null;
        }

        return ({
            title: e.summary,
            description: striptags(e.description),
            location: e.location,
            start: e.start.dateTime,
            end: e.end.dateTime,
            link: e.htmlLink,
            ...eventDetails
        });
    }), utils.isNonNull);
}


module.exports = {

    events: async () => {
        const calendarEvents = await getCalendarEvents();
        const eventDetails = await getEventDetails(calendarEvents);
        return eventDetails;
    }
}

// import { google } from "googleapis";
// import * as _ from "lodash";
// import config from "../../config";
// const activities = require("../activities.json");
// import { isNonNull, isNull } from "../utils";
// const schedule = (activities as any).schedule;
// // tslint:disable-next-line:no-namespace
// export namespace Schedule {

//     export async function today() {
//         const calendarEvents = await getCalendarEvents(
//             new Date(),
//             new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
//         );
//         const eventDetails = await getEventDetails(calendarEvents);
//         return eventDetails;
//     }

//     async function getCalendarEvents(start, end) {
//         try {
//             // Fetch events from google calendar
//             const calendar = await google.calendar({version: "v3"}).events.list({
//                 auth: config.google.apiKey,
//                 calendarId: config.scheduleCalendarId,
//                 showDeleted: false,
//                 singleEvents: true,
//                 timeMin: new Date(),
//                 timeMax: new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
//             });
//             return calendar.data.items;
//         } catch (err) {
//             console.error(err);
//         }
//     }

//     async function getEventDetails(events) {
//         return _.filter(_.map(events, (e) => {
//             const split = e.description.match(/(ID:)(.*)$/);
//             if (split < 3) {
//                 // tslint:disable-next-line:max-line-length
//                 console.warn(`Missing Event ID in calendar description for event ${e.summary} created by ${e.creator.displayName}`);
//                 return null;
//             }

//             const eventId = split[2].trim();
//             const eventDetails = _.find(schedule, (scheduledEvent) => {
//                 return scheduledEvent.id === eventId;
//             });

//             if (isNull(eventDetails)) {
//                 console.warn(`Missing Event details or mismatched Event ID in activities manifest for calendar event ${e.summary} created by ${e.creator.displayName}`);
//                 return null;
//             }

//             return ({
//                 title: e.summary,
//                 description: e.description,
//                 location: e.location,
//                 start: e.start.dateTime,
//                 end: e.end.dateTime,
//                 link: e.htmlLink,
//                 ...eventDetails
//             });
//         }), isNonNull);
//     }
// }
