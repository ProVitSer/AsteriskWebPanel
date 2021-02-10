let row = document.querySelector('.row'),
    extensionsTable = document.createElement('div'),
    html = '';

let statusClass = {
    "Idle": "label-success",
    "InUse": "label-warning",
    "Busy": "label-warning",
    "Unavailable": "label-danger",
    "Ringing": "label-warning",
    "InUse&Ringing": "label-warning",
    "Hold": "label-danger",
    "InUse&Hold": "label-danger",
    "Unknown": "label-danger",
};

let statusText = {
    "label-success": "Свободен",
    "label-warning": "Разговаривает",
    "label-danger": "Не зарегистрирован",
};

let statusLds = {
    "label-success": "Зарегистрирован",
    "label-danger": "Не зарегистрирован",
};

let officeName = {
    "Petrov": "",
    "Arhipov": "",
    "Shabanov": "",
    "Korajkina": "",
    "Romanov": "",
    "Rodiono": "",
    "ROP": "Помощник РОПа",
    "Service": "Сервисная компания",
    "Law": "Юридический отдел",
    "Buh": "Бухгалтерия",
    "Secretary": "Секретарь",
    "Personal": "Департамент Персонала",
    "Director": "Исполнительная дирекция",
    "Couch": "Коуч",
};

let socket;

const socketMessageListener = (event) => {
    let extStatus = JSON.parse(event.data);
    if (extStatus.id) {
        modifyStatus(extStatus.id);
    } else if (extStatus.lds) {
        modifyLDSStatus(extStatus.lds)
    } else {
        console.log(extStatus);
        createTable(extStatus);
    }
};

const socketOpenListener = (event) => {
    console.log("Соединение установлено.");
    getInfo();
};

const socketErrorListener = (event) => {
    console.log("Ошибка " + error.message);
};

const socketCloseListener = (event) => {
    if (socket) {
        console.error('Disconnected.');
    }
    socket = new WebSocket("ws://localhost:7777");
    socket.addEventListener('open', socketOpenListener);
    socket.addEventListener('message', socketMessageListener);
    socket.addEventListener('error', socketErrorListener);
    socket.addEventListener('close', socketCloseListener);
};

socketCloseListener();


const getInfo = () => {
    setTimeout(() => {
        socket.send('get-infoList');
    }, 1000);
}





let extesion = document.querySelector('#userDropdown');
extesion.innerHTML = `<span class="mr-2 d-none d-lg-inline text-gray-600 small">Добавочный ${localStorage.getItem('extension')}</span>
                        <img class="img-profile rounded-circle" src="https://source.unsplash.com/random/60x60">`;



const modifyLDSStatus = ({ id, status }) => {
    console.log(id, status);
    if (status) {
        status = 'Idle'
    } else {
        status = 'Unavailable'
    }
    let extensionId = document.getElementById(`status-lds-${id}`);
    extensionId.removeAttribute('class');
    extensionId.textContent = statusLds[statusClass[status]];
    extensionId.setAttribute('class', `label ${statusClass[status]}`);
};

const modifyStatus = ({ id, status, statustext }) => {
    let extensionId = document.getElementById(`status-blf-${id}`);
    extensionId.removeAttribute('class');
    extensionId.textContent = statusText[statusClass[statustext]];
    extensionId.setAttribute('class', `label ${statusClass[statustext]}`);

    if (statustext == 'Busy') {
        let extensionDND = document.getElementById(`btnDND-${id}`);
        extensionDND.removeAttribute('class');
        extensionDND.setAttribute('class', `btn btn-warning btn-circle btn-sm`);
    }

    if (statustext == 'Idle') {
        let extensionDND = document.getElementById(`btnDND-${id}`);
        extensionDND.removeAttribute('class');
        extensionDND.setAttribute('class', `btn btn-success btn-circle btn-sm`);
    }

};


const addDNDTransferButtonListener = () => {
    document.querySelectorAll('button.btn-sm').forEach(item => {
        document.querySelectorAll(`#btnDND-${item.name}`).forEach(item => {
            item.addEventListener('click', function(event) {
                event.preventDefault();
                socket.send(JSON.stringify({ 'dnd': { extension: event.target.name } }));
            });
        });
        document.querySelectorAll(`#btnTransfer-${item.name}`).forEach(item => {
            item.addEventListener('click', function(event) {
                event.preventDefault();
                socket.send(JSON.stringify({ 'transfer': { extension: event.target.name, transferExtension: localStorage.getItem('extension') } }));
            });
        });
    });
};

const addCustomDNDButtonListener = () => {
    document.querySelectorAll('#btnCustomDND').forEach(item => {
        item.addEventListener('click', function(event) {
            event.preventDefault();
            socket.send(JSON.stringify({ 'customdnd': { extension: localStorage.getItem('extension') } }));
        });
    });

};
addCustomDNDButtonListener();


const createTable = (result) => {
    console.log(result)
    for (let key in result) {

        html += `<div class="col-lg-4">
                    <div class="card mb-4">
                        <div class="card-header py-3">
                            <h6 class="m-0 font-weight-bold text-primary">${officeName[key]}</h6>
                        </div>
                        <div class="box">
                        <!-- /.box-header -->
                        <div class="box-body table-responsive no-padding">
                            <table class="table table-hover">
                                <tr>
                                    <th>Ext</th>
                                    <th>Имя</th>
                                    <th>BLF</th>
                                    <th>LDS</th>
                                    <th>Перевод</th>
                                </tr>`
        for (let n = 0; n < result[key].length; n++) {

            if (result[key][n].ldsStatus) {
                result[key][n].ldsStatus = 'Idle'
            } else {
                result[key][n].ldsStatus = 'Unavailable'
            }


            html += `<tr style="background-color: ${result[key][n].backgroundColor};" id=${result[key][n].id}>
                                     <td>${result[key][n].id}</td>
                                     <td>${result[key][n].name}</td>
                                     <td><span style="line-height:20px;" id="status-blf-${result[key][n].id}" class="label ${statusClass[result[key][n].statustext]}">${statusText[statusClass[result[key][n].statustext]]}</span></td>
                                     <td><span style="line-height:20px;" id="status-lds-${result[key][n].id}" class="label ${statusClass[result[key][n].ldsStatus]}">${statusLds[statusClass[result[key][n].ldsStatus]]}</span></td>
                                     <td>
                                         <button id="btnTransfer-${result[key][n].id}" type="button" name=${result[key][n].id} class="btn btn-success btn-circle btn-sm">T
                                         <br>
                                         <button id="btnDND-${result[key][n].id}" type="button" name=${result[key][n].id} class="btn btn-success btn-circle btn-sm">D
                                         </button>
                                     </td>
                                 </tr>`

        }
        html += `</table>
                </div>
                <!-- /.box-body -->
            </div>
        </div>
    </div>`

    }
    row.innerHTML = html;
    console.log(localStorage.getItem('user'));
    if (localStorage.getItem('user') == 'admin') {
        addDNDTransferButtonListener();

    };

};