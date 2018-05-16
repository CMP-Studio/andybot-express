const express = require('express');
const app = express();
const cors = require('cors')
const bodyParser = require('body-parser');
const morgan = require('morgan')

const User = require("./andybot/User");
const Scan = require("./andybot/Scan");
const Schedule = require("./andybot/Schedule");
const Trivia = require("./andybot/Trivia");

app.use(cors())
app.use(bodyParser.json());
app.use(morgan('combined'));

app.post('/getUser', async (req, res) => {
    try {
        const user = await User.get(req.body.page_id);
        res.json(user);
    } catch (err){
        res.json({
            error: "InternalError"
        });
    }
});

app.post('/createUser', async (req, res) => {
    try {
        const newUser = await User.create(req.body.page_id, req.body.name);
        res.json(newUser);
    } catch (err){
        res.json({
            error: "InternalError"
        });
    }
});

app.post('/userExists', async (req, res) => {
    try {
        const exists = await User.exists(req.body.page_id);
        res.json(exists);
    } catch (err){
        res.json({
            error: "InternalError"
        });
    }
});

app.post('/scan/scanCode', async (req, res) => {
    try {
        const scanResult = await Scan.scanCode(req.body.page_id, req.body.ref);
        res.json(scanResult);
    } catch (err){
        res.json({
            error: "InternalError"
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
            error: "InternalError"
        });
    }
})


app.post('/trivia/submitScore', async (req, res) => {
    try {
        const submitScoreResponse = await Trivia.submitScore(
            req.body.fb_page_id, req.body.activity_id, req.body.correct, req.body.total
        );
        res.json(submitScoreResponse);
    } catch (err){
        console.error(err);
        res.json({
            error: "InternalError"
        });
    }
})

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
