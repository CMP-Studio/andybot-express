
const tableName = 'scavengerhunt';
const db = require("../db");
const _ = require("lodash");
// const activities = require("./activities/json");

function pickNextClue(atClueNumber, clues) {
    return atClueNumber + 1;
}

module.exports = {
    clueFound: async (pageId, scan) => {
        console.log("Clue found");
        // const scan = _.find(activities.scan, (s) => s.messenger_code === scannedCode.ref );
        let nextClue;
        let clueAlreadyFound;
        // Look at the trigger to find the clue number

        try {
            cluesAlreadyFound = await db(tableName).select("*").where({
                fb_page_id: pageId,
            });

            if (scan.trigger === 0) {
                // This is the initial scan, no need to save this.
                nextClue = { clue: scavengerhunt[0].clue, clueNumber: 0 };
            } else if (scan.trigger === scavengerhunt.length) {
                nextClue = {
                    lastClue: true,
                    clueNumber: scavengerhunt.length,
                    followup: scavengerhunt[scan.trigger - 1].foundit,
                }; 
            } else if (scan.trigger > 0) {

                if  (cluesAlreadyFound.indexOf(scan.trigger) === -1) {
                    const recordSaved = await db(tableName).insert({
                        fb_page_id: pageId,
                        clue_number: scan.trigger
                    });
                    cluesAlreadyFound.push(scan.trigger);
                    clueAlreadyFound = false;
                } else {
                    clueAlreadyFound = true;
                }

                // Pick the next clue that makes sense
                // console.log("Scanned", scan.trigger - 1)
                const nextClueNumber = scan.trigger;

                if (nextClueNumber === null) {
                    nextClue = null;
                } else {
                    nextClue = { 
                        clue: scavengerhunt[nextClueNumber].clue,
                        followup: scavengerhunt[scan.trigger - 1].foundit,
                        clueNumber: nextClueNumber,
                        clueAlreadyFound
                    };

                }
            }
        } catch (err) {
            console.log("There was an err", err);
            return { error: err.message };
        }
    

        return nextClue;
    },

    getHint: async (clueNumber) => {

        // try {
        //     cluesAlreadyFound = await db(tableName).select("*").where({
        //         fb_page_id: pageId,
        //     });
        // } catch (err) {
            
        // }

        if (clueNumber <= scavengerhunt.length) {
            return { hint: scavengerhunt[clueNumber].hint };
        }
    }
}

const scavengerhunt = [
{
clue: `
This hunt starts at the top,
And works its way down, look for the oldest objects around.


We travel to a civilization hot and old, with dog-headed gods and coffins of gold.


Head to the back, find the burial room.
Your destination will look like a tomb. 
`,
hint: "You’ll find what you are looking for in the Walton Hall of Ancient Egypt.",
foundit: "The Chantress of Amun was the very first piece added to the museum.  Check out the accession number!"
},
{
clue: `Your next stop will help you cool off! Take a selfie with the Polar Bear!`,
hint: "You’ll find what you are looking for in Polar World: The Wyckoff Hall of Arctic Life.",
foundit: "Polar bears sometimes cover their nose with their paw to help them hide in the white snow!"
},
{
clue: `
Just like Dad-jokes, the next spot is corny.


Don’t get too a-maized, but there are two spots where you can practice your corn grinding skills.
Shucks, you might have to stalk through the rows of the exhibit before the answer pops out at you.


Talk it over with your team. They’re all ears. 
`,
hint: "You’ll find what you are looking for in the Alcoa Foundation Hall of American Indians.",
foundit: "Punderful work!"
},
{
clue: `Look through the hall with the birds that soar,
While you’re there, don’t be gloomy and look at the floor,
See the Section of Mystery and open the door.            
`,
hint: "You’ll find what you are looking for in Bird Hall.",
foundit: "I wonder what’s behind the other small door back there?"
},
{
clue: `It’s finally time to see the dinosaurs.
Take a right at the end of Bird Hall and travel to prehistoric times at the 3rd Floor Jurassic Overlook.


From there, how many dinosaur skeletons can you see?


If you think it’s 4, head to the Alaskan Brown Bear
If you think it’s 10, head to the Badger.         
`,
hint: "After counting, head downstairs to the Hall of North American Wildlife to see if you’re correct!",
foundit: `
Deciding on what ‘counts’ can be tricky.
In the case of the badger, scientists generally agree that there are 3 species. They do not count the infamous honey badger, because it is genetically and genealogically distant from the others. Something tells me honey badger don't care.
`
},

{
clue: `Search Botany Hall for a scent that reminds you of toothpaste.
On your way, you may catch a glimpse of giant whale jaws and teeth.
A mouth that big must need a lot of toothpaste!
`,
hint: "You’ll find what you are looking for in Botany Hall, but not in a display case!",
foundit: "Whales don’t actually brush their teeth. Seems fishy to me…"
},

{
clue: `It’s time to take a break on the Savannah.
Look for a tree to take a nap under.
Nothing to fear, you’re perfectly safe…
`,
hint: "You’ll find what you are looking for in the Hall of African Wildlife.",
foundit: "You made it to the tree, but did you spot a sneaky hunter?"
},
{
clue: `You’re almost to the end!  But it’s not time for a break,
Instead look for pelts, there is one that’s fake.


If you can’t see the code, here’s how you cope,
Examine the pelt with a microscope.        
`,
hint: "Look for the microscopes in Discovery Basecamp.",
foundit: "This was tricky, nice sleuthing!"
},
{
clue: `The hunt began with the first piece added to the collection, now look for the first dinosaur added by Andrew Carnegie.`,
hint: "You’ll find what you are looking for in the exhibit called Dinosaurs in Their Time.",
foundit: "How many paces does it take to get from the tip of his nose to the tip of his tail?"
},
{
clue: `Lots of gems and minerals in the collection are locked under glass to protect them from us, but one mineral has another layer to protect us from it!`,
hint: "You’ll find what you are looking for in the Hillman Hall of Minerals and Gems",
foundit: "Pure sulfur isn’t stinky- it produces odor when combined with hydrogen."
},
{
clue: `You might decide to add to your collection in our gift shop, or maybe you collected some great memories and pictures!
Look for another collection in the lobby.
`,
hint: "You’ll find what you are looking for at the bottom of the Grand Staircase.",
foundit: "While you’re here, don’t forget to look at the fantastic staircase, one of the most beautiful museum staircases in the world."
},
]

const numClues = scavengerhunt.length;
