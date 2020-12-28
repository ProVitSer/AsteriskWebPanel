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
        console.log(`http://${this.host}:${this.port}/ari/endpoints/SIP/${extension}?api_key=${this.username}:${this.password}`)
        let channelAId = await this.axiosReq('get', `http://${this.host}:${this.port}/ari/endpoints/SIP/${extension}?api_key=${this.username}:${this.password}`);
        console.log(`Получили результат на запрос Channel ID А плеча ${util.inspect(channelAId.data.channel_ids)}`);
        let bridgesId = await this.axiosReq('get', `http://${this.host}:${this.port}/ari/bridges?api_key=${this.username}:${this.password}`);
        console.log(`Получили результат всех bridges ${util.inspect(bridgesId.data)}`);


        for (const item of bridgesId.data) {
            if (item.channels[0] == channelAId.data.channel_ids) {
                console.log(`Нашли Channel ID B плеча ${util.inspect(item.channels[1])}`);
                let externalChannelId = await this.axiosReq('get', `http://${this.host}:${this.port}/ari/channels/${item.channels[1]}?api_key=${this.username}:${this.password}`);
                console.log(`Получили название канала для перевода ${util.inspect(externalChannelId.data.name)}`);
                return externalChannelId.data.name;
            }
            if (item.channels[1] == channelAId.data.channel_ids) {
                console.log(`Нашли Channel ID А плеча ${util.inspect(item.channels[1])}`);
                let externalChannelId = await this.axiosReq('get', `http://${this.host}:${this.port}/ari/channels/${item.channels[0]}?api_key=${this.username}:${this.password}`);
                console.log(`Получили название канала для перевода ${util.inspect(externalChannelId.data.name)}`);
                return externalChannelId.data.name;
            }
        }



    }

    async getExternalChannelName(channelBId) {
        let externalChannelId = await this.axiosReq('get', `http://${this.host}:${this.port}/ari/channels/${channelBId}?api_key=${this.username}:${this.password}`);
        console.log(`Получили название канала для перевода ${util.inspect(externalChannelId.data.name)}`);
        return externalChannelId.data.name;
    }

};

module.exports = Ari;