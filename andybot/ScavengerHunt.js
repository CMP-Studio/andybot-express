
const tableName = 'scavengerhunt';
const db = require("../db");
const _ = require("lodash");

module.exports = {
    numCluesFound: async (pageId) => {
        try {
            cluesAlreadyFound = await db(tableName).select("*").where({
                fb_page_id: pageId,
            });
            numCluesFound = cluesAlreadyFound.length;

            return numCluesFound;
        } catch (err) {
            console.log("There was an err", err);
            return 0;
        }
    },

    clueFound: async (pageId, scan) => {
        let clueNumbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]; // length = 12
        let objectsFound;
        let prevObjectsRemaining;
        let objectsRemaining;
        let nextClueNumber;

        let huntResponse = {};

        let objectScanned = parseInt(scan.trigger);

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
            objectsRemaining = _.filter(clueNumbers, (objectNum) => { return objectNum !== 0 && !objectsFound.includes(objectNum) });

            // Determine if they just finished the hunt
            if (objectsRemaining.length === 0 && prevObjectsRemaining.length !== 0) {
                huntResponse.lastScan = true;
            } else if (objectsRemaining.length === 0 && prevObjectsRemaining.length === 0) {
                huntResponse.huntComplete = true;
            }

            // If they found an object, determine which found it to show
            if (objectScanned >= 1 && objectScanned <= 11) {
                huntResponse.foundIt = scavengerhunt[objectScanned - 1];
            }

            // Determine which clue to send them next            
            if (objectsRemaining.length > 0) {
                let nextClue = objectScanned;
                let loopCount = 0;
                let loopMax = 15;
                while (!objectsRemaining.include(nextClue) && loopCount <= loopMax) {
                    nextClue = (nextClue + 1) % 11
                    loopCount++;
                }
                if (loopCount !== loopMax) {
                    huntResponse.nextClue = scavengerhunt[nextClue].clue;
                    huntResponse.nextClueNumber = nextClue;
                }
            }
                
        } catch (err) {
            console.log("There was an err", err);
            return { error: err.message };
        }

        console.log(huntResponse);
        return huntResponse;
    },

    getHint: async (clueNumber) => {
        if (clueNumber <= scavengerhunt.length) {
            return { hint: scavengerhunt[clueNumber].hint };
        }
    },
}

const scavengerhunt = [
{
    number: 1,
    clue: `This hunt starts at the top,
    And works its way down, look for the oldest objects around.


    We travel to a civilization hot and old, with dog-headed gods and coffins of gold.


    Head to the back, find the burial room.
    Your destination will look like a tomb. 
    `,
    hint: "You’ll find what you are looking for in the Walton Hall of Ancient Egypt.",
    foundit: "You found The Chantress of Amun Coffin! This was the very first piece added to the museum.  Check out the accession number!"
},
{
    number: 2,
    clue: `Your next stop will help you cool off! Say hello to the Polar Bear!`,
    hint: "You’ll find what you are looking for in Polar World: The Wyckoff Hall of Arctic Life.",
    foundit: "You found the Polar Bear! Polar bears sometimes cover their nose with their paw to help them hide in the white snow!"
},

{
    number: 3,
    clue: `Just like Dad-jokes, the next spot is corny.


    Don’t get too a-maized, but there are two spots where you can practice your corn grinding skills.
    Shucks, you might have to stalk through the rows of the exhibit before the answer pops out at you.


    Talk it over with your team. They’re all ears. 
    `,
    hint: "You’ll find what you are looking for in the Alcoa Foundation Hall of American Indians.",
    foundit: "You found Corn Grinding with the Iroquois! Punderful work!"
},

{
    number: 4,
    clue: `Look through the hall with the birds that soar,
    While you’re there, don’t be gloomy and look at the floor,
    See the Section of Mystery and open the door.            
    `,
    hint: "You’ll find what you are looking for in Bird Hall.",
    foundit: "You found the Section of Mystery! I wonder what’s behind the other small door back there? But stay focused! Are you ready for the next clue?"
},

{
    number: 5,
    clue: `It’s finally time to see the dinosaurs.
    Take a right at the end of Bird Hall and travel to prehistoric times at the 3rd Floor Jurassic Overlook.        
    `,
    hint: "Look for a scan code overlooking Dino Hall to get your next clue",
    foundit: `Dinomite! You found the Dino Hall overlook.`
},

{
    number: 6,
    clue: `
    Look down from the 3rd Floor Jurrassic Overlook. How many dinosaur skeletons can you see?


    If you think it’s 4, head to the Alaskan Brown Bear
    If you think it’s 10, head to the Badger.         
    `,
    hint: "After counting, head downstairs to the Hall of North American Wildlife to see if you’re correct!",
    foundit: `You found the Badger! Scientists generally agree that there are 3 species of badger. They do not count the infamous honey badger, because it is genetically and genealogically distant from the others. Something tells me honey badger don’t care.`
},

{
    number: 7,
    clue: `It’s time to take a break on the Savannah.
    Look for a tree to take a nap under.
    Nothing to fear, you’re perfectly safe…
    `,
    hint: "You’ll find what you are looking for in the Hall of African Wildlife.",
    foundit: "You made it to the Acacia Tree, but did you spot a sneaky hunter?"
},

{
    number: 8,
    clue: `You’re almost to the end!  But it’s not time for a break,
    Instead look for pelts, there is one that’s fake.


    If you can’t see the code, here’s how you cope,
    Examine the pelt with a microscope.        
    `,
    hint: "Look for the microscopes in Discovery Basecamp.",
    foundit: "You found the microscopic code! That was tricky, nice sleuthing!"
},

{
    number: 9, 
    clue: `The hunt began with the first piece added to the collection, now look for the first dinosaur added by Andrew Carnegie.`,
    hint: "You’ll find what you are looking for in the exhibit called Dinosaurs in Their Time.",
    foundit: "You found the Diplodocus Carnegii! How many paces does it take to get from the tip of his nose to the tip of his tail?"
},

{
    number: 10,
    clue: `Lots of gems and minerals in the collection are locked under glass to protect them from us, but one mineral has another layer to protect us from it!`,
    hint: "You’ll find what you are looking for in the Hillman Hall of Minerals and Gems",
    foundit: "You found the Sulfur! Pure sulfur isn’t stinky- it produces odor when combined with hydrogen."
},

{
    number: 11,
    clue: `You might decide to add to your collection in our gift shop, or maybe you collected some great memories and pictures!
    Look for another collection in the lobby.
    `,
    hint: "You’ll find what you are looking for at the bottom of the Grand Staircase.",
    foundit: "You found the Butterflies! While you’re here, don’t forget to look at the fantastic staircase, one of the most beautiful museum staircases in the world."
},
]

const numClues = scavengerhunt.length;
