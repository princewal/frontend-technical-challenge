const express = require('express');
const app = express();
const fs = require('fs');
const POINT_OF_SALES = require('./pos.json');
const CHANNELS = require('./channel.json');

const PORT = 5000;

app.use(express.json());

app.get('/pos', (req, res) => {
    res.json(POINT_OF_SALES);
});

app.get('/channel', (req, res) => {
    res.json(CHANNELS);
});

app.post('/account', (req, res) => {
    const accountPayload = req.body;
    const filename = `account_${Date.now()}.json`;

    if (!accountPayload || Object.keys(accountPayload).length === 0) {
        res.status(400).send({"error": "Missing payload"});
    }

    console.log("Saving data to disk:", accountPayload);
    fs.writeFileSync(filename, JSON.stringify(accountPayload, null, 4));
    res.sendStatus(200);
});

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});
