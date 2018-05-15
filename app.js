const express = require('express');
const app = express();

const morgan = require('morgan')


const User = require("./andybot/User");
const Scan = require("./andybot/Scan");



var bodyParser = require('body-parser');

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
})


app.listen(3001, () => console.log('Example app listening on port 3001!'))
