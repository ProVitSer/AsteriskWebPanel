"use strict";
const namiLib = require(`nami`),
    appConfig = require(`../config/config`);

const namiConfig = {
    host: appConfig.ami.host,
    port: appConfig.ami.port,
    username: appConfig.ami.username,
    secret: appConfig.ami.secret
};
let nami = new namiLib.Nami(namiConfig);


nami.on(`namiConnectionClose`, function(data) {
    console.log(`Переподключение к AMI ...`);
    setTimeout(function() {
        nami.open();
    }, 5000);
});

nami.on(`namiInvalidPeer`, function(data) {
    console.log(`Invalid AMI Salute. Not an AMI?`);
    process.exit();
});
nami.on(`namiLoginIncorrect`, function() {
    console.log(`Некорректный логин или пароль от AMI`);
    process.exit();
});
nami.on('namiConnected', function(event) {
    console.log(`Подключение к AMI успешно установлено`);
})

nami.logLevel = 0;
nami.open();

module.exports = nami;