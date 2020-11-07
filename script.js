const JsonServer = require('./src/JsonServer'),
    nami = require(`./models/ami`),
    WebSocket = require('ws');



const wss = new WebSocket.Server({ port: 7777 });
const jsonServer = new JsonServer();
const clients = [];


nami.on(`namiEventExtensionStatus`, (event) => {
    if (event.exten.length == 3) {
        console.log(event);
        jsonServer.setStatus(event);
        console.log(event);
        sendAll({ id: event.exten, status: event.status, statustext: event.statustext });
    }
});

const transfer = (extension, tarnsferExtension) => {
    console.log(extension, tarnsferExtension);
}


const showExtStatus = (ws) => {
    jsonServer.showExtensionStatus()
        .then(result => {
            let json = {};
            result.forEach((item) => {
                json[item.id] = { status: item.status, statustext: item.statustext };
            });
            json = JSON.stringify(json);
            ws.send(json);
        })
}

const sendAll = (event) => {
    let json = {};
    for (let j = 0; j < clients.length; j++) {
        json = JSON.stringify({ 'id': event });
        clients[j].send(json);
    }
}

wss.on('connection', function connection(ws) {
    let id = Math.random();
    clients[id] = ws;
    clients.push(ws);


    ws.on('message', function(message) {
        if (message == 'get-infoList') {
            showExtStatus(ws);

        }

    });

    ws.on('close', function() {
        delete clients[id];
    });

});