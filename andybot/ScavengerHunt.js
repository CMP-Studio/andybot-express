
const tableName = 'scavengerhunt';
const db = require("../db");
const _ = require("lodash");

module.exports = {

    clueFound: async (pageId, scan) => {
        let clueNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        let objectsFound;
        let prevObjectsRemaining;
        let objectsRemaining;
        let nextClueNumber;

        let huntResponse = {};

        try {
            objectsFound = await db(tableName).select("*").where({ fb_page_id: pageId });
            objectsFound = _.map(objectsFound, (p) => parseInt(p.clue_number) );

            // Determine if they just started the hunt
            if (objectsFound.length === 0) {
                huntResponse.firstScan = true;
            }

            // Create a list of remaining objects before this clue (not including a frame which doesn't need to be found to win)
            prevObjectsRemaining = _.filter(clueNumbers, (objectNum) => { return objectNum !== 0 && !objectsFound.includes(objectNum); });

            // If you scanned a code for the first time, record it in the database (even the a frame)
            if (objectsFound.indexOf(scan) === -1) {
                const recordSaved = await db(tableName).insert({
                    fb_page_id: pageId,
                    clue_number: scan
                });
                // When successfully recorded, add the scanned item to the local list
                objectsFound.push(scan);
            } else {
                //If it was already found...
                huntResponse.alreadyFound = true;  
            }

            // Create a list of remaining objects (not including a frame which doesn't need to be found to win)
            objectsRemaining = _.filter(clueNumbers, (objectNum) => { return objectNum !== 0 && !objectsFound.includes(objectNum) });

            // Determine if they just finished the hunt
            if (objectsRemaining.length === 0 && prevObjectsRemaining.length !== 0) {
                huntResponse.lastScan = true;
            } else if (objectsRemaining.length === 0 && prevObjectsRemaining.length === 0) {
                huntResponse.huntComplete = true;
            }

            // If they found an object, determine which found
            if (scan >= 1 && scan <= 10) {
                huntResponse.foundIt = scavengerhunt[scan - 1].foundit;
                if (scavengerhunt[scan - 1].pic !== undefined) {
                    huntResponse.pic = scavengerhunt[scan - 1].pic;
                }
            }

            // Determine which clue to send them next       
            if (objectsRemaining.length > 0) {
                let nextObject = -1;
                let numObjects = 10 + 1; // Add 1 for the modulo operation
                for(var i = 0; i < numObjects; ++i){
                    tryNextObject = (scan + i) % numObjects
                    if(objectsRemaining.includes(tryNextObject)){
                        nextObject = tryNextObject;
                        break;
                    }
                }
                if (nextObject != -1) {
                    let nextClue = nextObject - 1;
                    huntResponse.nextClue = scavengerhunt[nextClue].clue;
                    huntResponse.nextClueNumber = nextClue;
                }
            }
                
        } catch (err) {
            console.log("There was an err", err);
            return { error: err.message };
        }
        return huntResponse;
    },

    getClue: async (clueNumber) => {
        if (clueNumber <= scavengerhunt.length) {
            return { clue: scavengerhunt[clueNumber].clue };
        }
    },

    getHint: async (clueNumber) => {
        if (clueNumber <= scavengerhunt.length) {
            return { hint: scavengerhunt[clueNumber].hint };
        }
    },

    getProgress: async (pageId) => {
        try {
            cluesAlreadyFound = await db(tableName).select("*").where({
                fb_page_id: pageId,
            });
            let cluesFound = _.map(cluesAlreadyFound, (p) => { return parseInt(p.clue_number) });

            return cluesFound;
        } catch (err) {
            console.log("There was an err", err);
            return [];
        }
    },

    clearProgress: async (pageId) => {
        try {
            console.log("trying to clear progress for user");
            console.log(pageId);
            const recordSaved = await db(tableName).where({ 'fb_page_id': pageId }).del();
            return true;
        } catch (err) {
            console.log("There was an err", err);
            return [];
        }
    }

}

const scavengerhunt = [
{
    number: 1,
    clue: `🔎1⃣: Can you find the oldest museum entrance, surrounded by pillars of green?`,
    hint: "To find item 1⃣, walk beyond the Hall of Architecture to the room with green columns.",
    foundit: "You found 1⃣! This beautiful foyer of Carnegie Music Hall was built in 1895. The Music Hall lies just around the corner to your left, and the original doors were located between the Foyer and the Hall. Check out this pic of the original building!",
    pic: "early_museum_oakland.jpg"
},
{
    number: 2,
    clue: `🔎2⃣: Since we’re talking about history, here’s the next clue. Imagine the sound of a horse and carriage, rolling up to this side entrance off Forbes Avenue. You’ll find me there, by a wooden door between doors.`,
    hint: "To find 2⃣, look in the entryway of the Carriage Drive entrance.",
    foundit: "You found 2⃣! Great work! Through this door lies the Founder’s Room, which was the office of museum founder Andrew Carnegie.",
    pic: "6B63231B9FC5B87BC115E7503796.jpg"
},

{
    number: 3,
    clue: `🔎3⃣: Now it’s time to head to one of my favorite spots! Visit a set of stairs surrounded by murals, considered to be one of the most beautiful museum staircases in the world.`,
    hint: "To find 3⃣, go to the multi-level Grand Staircase.",
    foundit: "You found 3⃣! These murals were painted by John White Alexander, a Pittsburgh native. Alexander also worked on the very first Carnegie International exhibition in 1895."
},

{
    number: 4,
    clue: `🔎4⃣: Shine bright like a diamond—or crystal! Look for me inside the Bruce Galleries by two dazzling decanters.`,
    hint: "To find 4⃣, visit the Bruce Galleries located on the second floor, just off the Grand Staircase.",
    foundit: "You found 4⃣! These sparkling decanters were made for President James Monroe, one of America’s founding fathers, in 1818. Quite different from our modern water bottles, right?"
},

{
    number: 5,
    clue: `🔎5⃣: It’s a bird, it’s a plane, it’s…a metal couch? Look for me just around the corner and decide for yourself.`,
    hint: "To find 5⃣, enter the gallery next to the wall of chairs.",
    foundit: `You found 5⃣! Nice work! This sleek couch made history when it appeared in a Madonna music video in 1988. The Museum of Art was the first to recognize the Lockheed Lounge’s artistic value and add it to our collection.`
},

{
    number: 6,
    clue: `🔎6⃣: The next item is young, but it’s also very, very old. Look for me by a coffin made of gold.`,
    hint: "To find 6⃣, head to Walton Hall of Ancient Egypt.",
    foundit: `You found 6⃣! Great work! This child mummy was the first item in the collection at the Museum of Natural History.`
},

{
    number: 7,
    clue: `🔎7⃣: You’ll find me where the birds are singing, hanging out with an ancestor of our feathered friends.`,
    hint: "To find 7⃣, scan the walls of Bird Hall for your answer.",
    foundit: "You found 7⃣! Archaeopteryx, discovered in 1860, was once believed to be the earliest known bird. Today, it’s recognized as a significant transitional fossil between dinosaurs and birds."
},

{
    number: 8,
    clue: `🔎8⃣: It’s almost Thanksgiving, and the holiday meal wouldn’t be complete without this bird. Can you find it—and me?`,
    hint: "To find 8⃣, walk down the hall from 7⃣",
    foundit: "You found 8⃣! Good job! Ben Franklin wanted the turkey to be America’s national bird, but the bald eagle won instead. In fact, the #1 bird in our collection is a bald eagle rumored to have perished at the Battle of Gettysburg."
},

{
    number: 9, 
    clue: `🔎9️⃣: Speaking of birds, I’d like to introduce you to a strange-looking dinosaur that looks like a huge chicken. Can you find it hiding in Dinosaurs in Their Time?`,
    hint: "To find 9️⃣, look near the two T. rex. (Use the stairs or elevator located just beyond Population Impact to go downstairs).",
    foundit: "You found 9⃣! This creature, Anzu wyleii, is the first one of its kind. In scientific terms, we call this a holotype. Carnegie paleontologist Matt Lamanna was part of the team that discovered Anzu."
},

{
    number: 10,
    clue: `🔎🔟: Can you locate the first dinosaur discovered by Carnegie paleontologists? You’ll find me there!`,
    hint: "To find 🔟, look for the dinosaur with the longest tail.",
    foundit: "You found 🔟! Diplodocus carnegii—affectionately known as Dippy—was unearthed in 1899. In fact, the Museum of Natural History was called “the House that Dippy Built.",
    pic: "olddippy.jpg"
},
]

const numClues = scavengerhunt.length;
