require('dotenv').config()

const express = require('express');
const app = express();
const cors = require('cors')
const bodyParser = require('body-parser');
const morgan = require('morgan')

const User = require("./andybot/User");
const Scan = require("./andybot/Scan");
const Schedule = require("./andybot/Schedule");
const Trivia = require("./andybot/Trivia");
const ScavengerHunt = require("./andybot/ScavengerHunt");

app.use(cors())
app.use(bodyParser.json());
app.use(morgan('combined'));

app.post('/getUser', async (req, res) => {
    try {
        const user = await User.get(req.body.page_id);
        res.json(user);
    } catch (err){
        res.json({
            error: err.message
        });
    }
});

app.post('/createUser', async (req, res) => {
    try {
        const newUser = await User.create(req.body.page_id, req.body.name);
        res.json(newUser);
    } catch (err){
        res.json({
            error: err.message
        });
    }
});

app.post('/userExists', async (req, res) => {
    try {
        const exists = await User.exists(req.body.page_id);
        res.json(exists);
    } catch (err){
        res.json({
            error: err.message
        });
    }
});

app.post('/avaliableActivities', async (req, res) => {
    try {
        const avaliableActivities = await User.avaliableActivities(req.body.page_id);
        res.json(avaliableActivities);
    } catch (err){
        console.log(err);
        res.json({
            error: err.message
        });
    }
});

app.post('/avaliableEvents', async (req, res) => {
    try {
        console.log(req.body.page_id)
        const avaliableEvents = await Schedule.events(req.body.page_id);
        res.json(avaliableEvents);
    } catch (err){
        console.log(err);
        res.json({
            error: err.message
        });
    }
});

app.post('/scan/scanCode', async (req, res) => {
    try {
        const scanResult = await Scan.scanCode(req.body.page_id, req.body.ref);
        res.json(scanResult);
    } catch (err){
        res.json({
            error: err.message
        });
    }
});

app.get('/events', async (req, res) => {
    try {
        const eventsResponse = await Schedule.events();
        res.json(eventsResponse);
    } catch (err){
        console.error(err);
        res.json({
            error: err.message
        });
    }
});


app.post('/trivia/submitScore', async (req, res) => {
    try {
        const submitScoreResponse = await Trivia.submitScore(
            req.body.fb_page_id, req.body.activity_id, req.body.correct, req.body.total
        );
        res.json(submitScoreResponse);
    } catch (err){
        console.error(err);
        res.json({
            error: err.message
        });
    }
});

app.post('/poll/getResponses', async (req, res) => {
    try {
        const pollResponses = await Poll.getResponses(req.body.fb_page_id, req.body.activity_id);
        res.json(pollResponses);
    } catch (err){
        console.error(err);
        res.json({
            error: err.message
        });
    }
});

app.post('/poll/submitResponse', async (req, res) => {
    try {
        const submitPollResponse = await Poll.submitResponse(req.body.fb_page_id, req.body.activity_id, req.body.question_number, req.body.answer);
        res.json(submitPollResponse);
    } catch (err){
        console.error(err);
        res.json({
            error: err.message
        });
    }
});

app.post('/poll/getResponsesForQuestion', async (req, res) => {
    try {
        const pollQuestionResponse = await Poll.getResponsesForQuestion(req.body.activity_id, req.body.question_number);
        res.json(pollQuestionResponse);
    } catch (err){
        console.error(err);
        res.json({
            error: err.message
        });
    }
});

app.post("/achievement/progress", async (req, res) => {
    try {
        const achievementProgress = await Achievement.progress(req.body.fb_page_id);
        res.json(achievementProgress);
    } catch (err){
        console.error(err);
        res.json({
            error: err.message
        });
    }
})


app.post("/scavengerhunt/getClue", async (req, res) => {
    try {
        const clue = await ScavengerHunt.getClue(req.body.fb_page_id);
        res.json(clue);
    } catch (err){
        console.error(err);
        res.json({
            error: err.message
        });
    }
})

app.post("/scavengerhunt/clearProgress", async (req, res) => {
    try {
        const eventsResponse = await Schedule.events();
        res.json(eventsResponse);
        const cleared = await ScavengerHunt.clearProgress(req.body.page_id);
        res.json(cleared);
    } catch (err){
        console.error(err);
        res.json({
            error: err.message
        });
    }
})


app.post("/scavengerhunt/getHint", async (req, res) => {
    try {
        const hint = await ScavengerHunt.getHint(req.body.clue_number);
        res.json(hint);
    } catch (err){
        console.error(err);
        res.json({
            error: err.message
        });
    }
})

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
