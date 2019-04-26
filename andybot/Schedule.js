const _ = require("lodash");
const google = require("googleapis").google;
const config = require("../config");
const utils = require("../utils");
const schedule = require("./activities.json").schedule;
const striptags = require('striptags');

async function getCalendarEvents() {

    function ISODateString(d){
        function pad(n){return n<10 ? '0'+n : n}
        return d.getUTCFullYear()+'-'
            + pad(d.getUTCMonth()+1)+'-'
            + pad(d.getUTCDate())+'T'
            + pad(d.getUTCHours())+':'
            + pad(d.getUTCMinutes())+':'
            + pad(d.getUTCSeconds())+'Z'
    }

    let timeMin = new Date(); //new Date();
    timeMin = ISODateString(timeMin);

    try {
        // Fetch events from google calendar
        // https://developers.google.com/calendar/v3/reference/events/list
        const calendar = await google.calendar({version: "v3"}).events.list({
            auth: config.google.apiKey,
            calendarId: config.scheduleCalendarId,
            showDeleted: false,
            singleEvents: true,
            orderBy: "startTime",
            timeMin: timeMin,
            maxResults: 2000,
        });
        console.log(calendar.data.items);
        return calendar.data.items;
    } catch (err) {
        console.error(err);
    }
}

async function getEventDetails(events) {
    return _.uniqBy(_.filter(_.map(events, (e) => {
        console.log("EVENTT:");
        console.log(e.summary);
        console.log(e.start);
        console.log(e.end);
        const split = striptags(e.description).match(/(ID:)(.*)$/);
        if (utils.isNull(split) || split.length < 3) {
            // tslint:disable-next-line:max-line-length
            console.warn(`Missing Event ID in calendar description for event ${e.summary} created by ${e.creator.displayName}`);
            return null;
        }

        const eventId = split[2].trim();

        const eventDetails = _.find(schedule, (scheduledEvent) => {
            return scheduledEvent.id === eventId;
        });

        if (utils.isNull(eventDetails)) {
            console.warn(`Missing Event details or mismatched Event ID in activities manifest for calendar event ${e.summary} created by ${e.creator.displayName}`);
            return null;
        }

        let isNotToday;
        const today = new Date().setHours(0,0,0,0);
        const eventDay = new Date(e.start.dateTime).setHours(0,0,0,0);
        if (today === eventDay) { 
            isNotToday = false;
            console.log(e.summary);
            console.log("IS TODAY");
          } else { 
            isNotToday = true;
          }  
        // If start time is not today
        // Or this is not stamp earner, then don't show it.
        if (eventDetails.stamp_id === undefined && isNotToday) {
            return null;
        }

        let location;
        switch(eventDetails.location) {
            case "Warhol":
                location = "The Andy Warhol Museum"
                break;
            case "CSC":
                location = "Carnegie Science Center"
                break;
            case "CMOA":
                location = "Carnegie Museum of Art"
                break;
            case "CMNH":
                location = "Carnegie Museum of Natural History"
                break;
            default:
                break;
        }

        return ({
            eventId: eventId,
            title: e.summary,
            subtitle: eventDetails.when + " @ " + location,
            link: eventDetails.url,
        });
    }), utils.isNonNull), 'title');
}


module.exports = {

    events: async (pageId) => {
        const calendarEvents = await getCalendarEvents();
        const eventDetails = await getEventDetails(calendarEvents);
        return eventDetails;
    }
}

