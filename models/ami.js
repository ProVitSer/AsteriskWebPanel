"use strict";
const namiLib = require(`nami`);

const namiConfig = {
    host: '185.69.154.243',
    port: 5038,
    username: 'vitalik',
    secret: 'dda991d6e0c001e0faf19cf2ad411dc8'
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