'use strict';
const axios = require('axios');


class Axios {
    constructor() {

    }

    async axiosReq(metod, url, data = '') {
        let config = {
            method: metod,
            url: url,
            headers: {
                'Content-Type': 'application/json'
            },
            data: data
        };

        const res = await axios(config)
        const result = await res;
        if (!result) {
            console.log('Отсутствует результат');
        } else {
            return result;
        }
    }
}

module.exports = Axios;