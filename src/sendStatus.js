'use strict';
const axios = require('axios'),
    util = require('util');


class SendStatus {
    constructor(urlSendEvent = 'http://localhost:3000/extensions/112') {
        this.urlSendEvent = urlSendEvent;
    }

    async setStatus({ exten, status, statustext }) {
        console.log(`Внутренний номер ${exten} цифровой статус ${status} текстовый статус ${statustext}`);
        let data = JSON.stringify({ "status": status, "statustext": statustext });

        let config = {
            method: 'put',
            url: `http://localhost:3000/extensions/${exten}`,
            headers: {
                'Content-Type': 'application/json'
            },
            data: data
        };

        const res = await axios(config);
        const result = await res;

        console.log(`Получили результат на запрос ${util.inspect(result.data)}`);
        if (!result) {
            console.log('Отсутствует результат');
            return [];
        }
        return result.data;
    };

};

module.exports = SendStatus;