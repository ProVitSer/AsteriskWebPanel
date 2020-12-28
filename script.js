const JsonServer = require('./src/JsonServer'),
    Ari = require('./src/ari'),
    Lds = require('./src/lds'),
    nami = require(`./models/ami`),
    WebSocket = require('ws'),
    namiLib = require(`nami`);



const ws = new WebSocket.Server({ port: 7777 });
const jsonServer = new JsonServer();
const ari = new Ari();
const lds = new Lds();
const clients = [];
const status = {
    "statusDND": {
        on: '1',
        off: ''
    },
    "statusHint": {
        on: 'Busy',
        off: 'Unavailable'
    }
}


nami.on(`namiEventExtensionStatus`, (event) => {
    if (event.exten.length == 3) {
        console.log(event);
        modufiExtStatus(event);
        sendAll({ id: event.exten, status: event.status, statustext: event.statustext });
    }
});

async function transfer({ extension, transferExtension }) {
    console.log(extension, transferExtension);
    const channelId = await ari.getExternalChannelId(transferExtension);
    trasferCall(channelId, extension);
}


const trasferCall = (channelId, extension) => {
    console.log(channelId, extension);
    let action = new namiLib.Actions.BlindTransfer();
    action.Channel = channelId;
    action.Context = 'from-internal-xfer';
    action.Exten = extension;
    nami.send(action);
}
const getDNDStatus = (extension) => {
    let action = new namiLib.Actions.DbGet();
    action.Family = 'DND';
    action.Key = extension;
    nami.send(action, (m) => {
        if (m.events[0].val == '') {
            setDNDStatus(extension, status.statusDND.on, status.statusHint.on);
        } else {
            setDNDStatus(extension, status.statusDND.off, status.statusHint.off);
        }
    });
};

const setDNDStatus = (extension, dnd, hint) => {
    console.log(extension, status);
    let action = new namiLib.Actions.DbPut();
    action.Family = 'DND';
    action.Key = extension;
    action.Val = dnd;
    nami.send(action, (m) => {
        console.log(m.response);
        if (m.response == 'Success') {
            setHintStatus(extension, hint);
        }
    });
}

const setHintStatus = (extension, hint) => {
    console.log(extension, hint);
    let action = new namiLib.Actions.Command();
    action.Command = `devstate change Custom:DND${extension} ${hint}`;
    console.log(util.inspect(action));
    nami.send(action, (m) => {
        console.log(m);
    });
}

const modufiExtStatus = ({ exten, status, statustext }) => {
    jsonServer.showExtensionStatus()
        .then(result => {
            for (let key in result) {
                for (let n = 0; n < result[key].length; n++) {
                    if (result[key][n].id == exten) {
                        console.log(key)
                        jsonServer.setStatus(exten, status, statustext, key);
                    }
                }
            }

        })
}

const showExtStatus = (w) => {
    jsonServer.showExtensionStatus()
        .then(result => {
            w.send(JSON.stringify(result));
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
        console.log(message);
        if (message == 'get-infoList') {
            showExtStatus(w);

        } else {
            let data = JSON.parse(message);
            if (data.transfer) {
                transfer(data.transfer);
            } else if (data.dnd) {
                getDNDStatus(data.dnd.extension);
                console.log(data.dnd.extension);
            } else if (data.customdnd) {
                getDNDStatus(data.customdnd.extension);
                console.log(data.customdnd.extension);
            }

        }

    });

    w.on('close', function() {
        console.log(`Close ${id}`);
        delete clients[id];
    });

});


const sendLDSStatusToAll = (event) => {
    let ids = Object.keys(clients);
    ids.forEach((id) => {
        clients[id].send(JSON.stringify({ 'lds': event }));
    });
}


const getLDSStatus = () => {
    lds.getLDSStatus()
        .then(result => {
            showExten(result);
        })
}


const showExten = (lds) => {
    jsonServer.showExtensionStatus()
        .then(jsonExtStatus => {
            for (let key in jsonExtStatus) {
                for (let n = 0; n < jsonExtStatus[key].length; n++) {
                    for (let i = 0; i < lds.length; i++) {
                        if (jsonExtStatus[key][n].id == lds[i]['sip_id']) {
                            jsonServer.setLds(jsonExtStatus[key][n].id, key, lds[i]['is_active']);
                            sendLDSStatusToAll({ id: jsonExtStatus[key][n].id, status: lds[i]['is_active'] });
                        }

                    }

                }
            }

        })
}

setInterval(getLDSStatus, 60000);