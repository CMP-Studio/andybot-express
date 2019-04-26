
const tableName = 'scavengerhunt';
const db = require("../db");
const _ = require("lodash");
const scavengerhunt = require("./activities.json")["scavengerhunt"];

module.exports = {
    numCluesFound: async (pageId) => {
        try {
            cluesAlreadyFound = await db(tableName).select("*").where({
                fb_page_id: pageId,
            });
            let objectsFound = _.filter(cluesAlreadyFound, (p) => { return parseInt(p.clue_number) !== 0 });
            numCluesFound = objectsFound.length;

            return numCluesFound;
        } catch (err) {
            console.log("There was an err", err);
            return 0;
        }
    },

    clueFound: async (pageId, clueFound) => {
        let clueNumbers = Array.from({length: scavengerhunt.length}, (v, k) => k+1);
        let objectsFound;
        let prevObjectsRemaining;
        let objectsRemaining;
        let nextClueNumber;

        let huntResponse = {};

        let objectScanned = parseInt(clueFound);

        try {
            objectsFound = await db(tableName).select("*").where({ fb_page_id: pageId });
            objectsFound = _.map(objectsFound, (p) => parseInt(p.clue_number) );

            // Determine if they just started the hunt
            if (objectsFound.length === 0) {
                huntResponse.firstScan = true;
            } 
            // or have already completed it
            if (objectsFound.length >= scavengerhunt.length) {
                huntResponse.completed = true;
            }

            // If you scanned a code for the first time, record it in the database
            if (objectsFound.indexOf(objectScanned) === -1) {
                const recordSaved = await db(tableName).insert({
                    fb_page_id: pageId,
                    clue_number: objectScanned
                });
                // When successfully recorded, add the scanned item to the local list
                objectsFound.push(objectScanned);
            } else {
                //If it was already found...
                huntResponse.alreadyFound = true;  
            }

            // Create a list of remaining objects (not including a frame which doesn't need to be found to win)
            objectsRemaining = _.filter(clueNumbers, (objectNum) => { return !objectsFound.includes(objectNum) });

            // Determine if they just finished the hunt
            if (objectsRemaining.length === 0) {
                huntResponse.lastScan = true;
            }

            // If they found an object, determine which found
            if (objectScanned >= 1 && objectScanned <= scavengerhunt.length) {
                huntResponse.foundIt = scavengerhunt[objectScanned - 1].answer;
            }

            // Determine which clue to send them next       
            if (objectsRemaining.length > 0) {
                let nextObject = -1;
                let numObjects = scavengerhunt.length;
                for(var i = objectScanned; i <= numObjects*2; ++i){
                    tryNextObject = i % (numObjects + 1)
                    if (objectsRemaining.includes(tryNextObject)){
                        huntResponse.nextClue = scavengerhunt[tryNextObject-1].clue;
                        huntResponse.nextClueNumber = tryNextObject;
                        break;
                    }
                }
            }
                
        } catch (err) {
            console.log("There was an err", err);
            return { error: err.message };
        }

        return huntResponse;
    },

    getClue: async (pageId) => {
        let clueNumbers = Array.from({length: scavengerhunt.length}, (v, k) => k+1);
        let objectsFound;
        let objectsRemaining;
        let nextClueNumber;

        let huntResponse = {};

        try {
            objectsFound = await db(tableName).select("*").where({ fb_page_id: pageId });
            objectsFound = _.map(objectsFound, (p) => parseInt(p.clue_number) );

            // Determine if they just started the hunt
            if (objectsFound.length === 0) {
                huntResponse.begin = true;
            } 
            // or have already completed it
            if (objectsFound.length >= scavengerhunt.length) {
                huntResponse.completed = true;
            }

            // Create a list of remaining objects
            objectsRemaining = _.filter(clueNumbers, (objectNum) => { return !objectsFound.includes(objectNum) });

            // Determine which clue to send them next       
            if (objectsRemaining.length > 0) {
                let nextObject = -1;
                let numObjects = scavengerhunt.length;
                for(var i = 0; i <= numObjects*2; ++i){
                    tryNextObject = i % (numObjects + 1)
                    if (objectsRemaining.includes(tryNextObject)){
                        huntResponse.nextClue = scavengerhunt[tryNextObject-1].clue;
                        huntResponse.nextClueNumber = tryNextObject;
                        break;
                    }
                }
            }
                
        } catch (err) {
            console.log("There was an err", err);
            return { error: err.message };
        }

        return huntResponse;
    },

    getHint: async (clueNumber) => {
        if (clueNumber <= scavengerhunt.length) {
            return { hint: scavengerhunt[clueNumber-1].hint };
        }
    },
}

const numClues = scavengerhunt.length;
