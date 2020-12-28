'use strict';
const axios = require('axios');


class Lds {
    constructor() {

    }

    async getLDSStatus() {
        let config = {
            method: 'get',
            url: 'https://lds.bigland.ru/api/v2/users?fields=is_active,id,sip_id&expand=amo,post&per-page=1000',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer EQNB4DvxJ1H_HIsADPfkZaTsw5J2WnEDMr3S8QtsdEYl_k9B7mIC-6CZ8w7lCEaC',
                'Cookie': '_csrf=fb1ba4a38e964099fe58dbc2d88084cad7d3cd77bea2fa449829a9d0c7bf2346a%3A2%3A%7Bi%3A0%3Bs%3A5%3A%22_csrf%22%3Bi%3A1%3Bs%3A32%3A%22q1D3FBOD_Kgp5mmb6SxtkYrQERmVbBTd%22%3B%7D'
            }
        };

        const res = await axios(config)
        const result = await res;
        if (!result) {
            console.log('Отсутствует результат');
        } else {
            return result.data.items;
            //console.log(result.data.items)
        }
    }
}



module.exports = Lds;