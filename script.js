const JsonServer = require('./src/JsonServer'),
    Ari = require('./src/ari'),
    nami = require(`./models/ami`),
    WebSocket = require('ws'),
    client = require('ari-client');

const ws = new WebSocket.Server({ port: 7777 });
const jsonServer = new JsonServer();
const ari = new Ari();
const clients = [];


nami.on(`namiEventExtensionStatus`, (event) => {
    if (event.exten.length == 3) {
        console.log(event);
        jsonServer.setStatus(event);
        console.log(event);
        sendAll({ id: event.exten, status: event.status, statustext: event.statustext });
    }
});

async function transfer({ extension, transferExtension }) {
    console.log(extension, transferExtension);
    let channelId = await ari.getExternalChannelId(transferExtension);
    trasferCall(channelId);
}


const trasferCall = (channelId) => {
    console.log(channelId);
}


const showExtStatus = (w) => {
    jsonServer.showExtensionStatus()
        .then(result => {
            let json = {};
            result.forEach((item) => {
                json[item.id] = { status: item.status, name: item.name, statustext: item.statustext };
            });
            w.send(JSON.stringify(json));
        })
}

const sendAll = (event) => {
    let ids = Object.keys(clients);
    ids.forEach((id) => {
        clients[id].send(JSON.stringify({ 'id': event }));
    });
}

ws.on('connection', function connection(w) {

    let id = Math.random();
    clients[id] = w;
    console.log("новое соединение " + id);

    w.on('message', function(message) {
        if (message == 'get-infoList') {
            showExtStatus(w);

        } else {
            let transferExt = JSON.parse(message);
            transfer(transferExt.transfer);
        }

    });

    w.on('close', function() {
        console.log(`Close ${id}`);
        delete clients[id];
    });

});