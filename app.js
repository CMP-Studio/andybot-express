require('dotenv').config()

const express = require('express');
const app = express();
const cors = require('cors')
const bodyParser = require('body-parser');
const morgan = require('morgan')

const User = require("./andybot/User");
const Scan = require("./andybot/Scan");
const ScavengerHunt = require("./andybot/ScavengerHunt");

app.use(cors())
app.use(bodyParser.json());
app.use(morgan('combined'));

app.post('/getUser', async (req, res) => {
    try {
        const user = await User.get(req.body.page_id);
        console.log(user);
        res.json(user);
    } catch (err){
        console.log(err);
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
        console.log("EX");
        console.log(exists);
        res.json(exists);
    } catch (err){
        console.log("EX err");
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

app.post("/scavengerhunt/clearProgress", async (req, res) => {
    try {
        const cleared = await ScavengerHunt.clearProgress(req.body.page_id);
        res.json(cleared);
    } catch (err){
        console.error(err);
        res.json({
            error: err.message
        });
    }
});


app.post("/scavengerhunt/getProgress", async (req, res) => {
    try {
        const progress = await ScavengerHunt.getProgress(req.body.page_id);
        res.json(progress);
    } catch (err){
        console.error(err);
        res.json({
            error: err.message
        });
    }
});

app.post("/scavengerhunt/getClue", async (req, res) => {
    try {
        const hint = await ScavengerHunt.getClue(req.body.clue_number);
        res.json(hint);
    } catch (err){
        console.error(err);
        res.json({
            error: err.message
        });
    }
});


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
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
