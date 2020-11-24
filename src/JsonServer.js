'use strict';
const util = require('util'),
    appConfig = require('../config/config'),
    Axios = require('./axios');


class JsonServer extends Axios {
    constructor(jsonServerHost = appConfig.jsonServer.host, jsonServerPort = appConfig.jsonServer.port) {
        super();
        this.jsonServerHost = jsonServerHost;
        this.jsonServerPort = jsonServerPort;
    }

    async setStatus(exten, status, statustext, key) {
        console.log(`Внутренний номер ${exten} цифровой статус ${status} текстовый статус ${statustext} офис ${key}`);
        let result = await this.axiosReq('patch',
            `http://${this.jsonServerHost}:${this.jsonServerPort}/${key}/${exten}`,
            JSON.stringify({ "status": status, "statustext": statustext }));
        console.log(result);
    };

    async showExtensionStatus() {
        let result = await this.axiosReq('get',
            `http://${this.jsonServerHost}:${this.jsonServerPort}/db`);

        return (result.data);
    };

};

module.exports = JsonServer;