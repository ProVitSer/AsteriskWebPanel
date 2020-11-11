const util = require('util'),
    appConfig = require('../config/config'),
    Axios = require('./axios');


class Ari extends Axios {
    constructor(username = appConfig.ari.username, password = appConfig.ari.secret, host = appConfig.ari.host, port = appConfig.ari.port) {
        super();
        this.username = username;
        this.password = password;
        this.host = host;
        this.port = port;
    }

    async getExternalChannelId(extension) {

        let channelAId = await this.axiosReq('get', `http://${this.host}:${this.port}/ari/endpoints/PJSIP/${extension}?api_key=${this.username}:${this.password}`);
        console.log(`Получили результат на запрос Channel ID А плеча ${util.inspect(channelAId.data.channel_ids)}`);
        let bridgesId = await this.axiosReq('get', `http://${this.host}:${this.port}/ari/bridges?api_key=${this.username}:${this.password}`);
        console.log(`Получили результат всех bridges ${util.inspect(bridgesId.data)}`);
        bridgesId.data.forEach((item) => {
            if (item.channels[0] == channelAId.data.channel_ids) {
                console.log(`Нашли Channel ID B плеча ${util.inspect(item.channels[1])}`);
                this.getExternalChannelName(item.channels[1]);
            }
        });

    }

    async getExternalChannelName(channelBId) {
        let externalChannelId = await this.axiosReq('get', `http://${this.host}:${this.port}/ari/channels/${channelBId}?api_key=${this.username}:${this.password}`);
        console.log(`Получили название канала для перевода ${util.inspect(externalChannelId.data.name)}`);
        return externalChannelId.data.name;
    }

};

module.exports = Ari;