const SendStatus = require('./src/sendStatus'),
    nami = require(`./models/ami`);

const sendStatus = new SendStatus();

let status = {
    "NO ANSWER": "Missed",
    "ANSWERED": "Completed",
    "BUSY": "Busy"
};

nami.on(`namiEventExtensionStatus`, (event) => {
    if (event.exten.length == 3) {
        console.log(event);
        sendStatus.setStatus(event);
    }
});