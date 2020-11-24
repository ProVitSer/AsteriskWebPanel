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

const socket = new WebSocket("ws://localhost:7777");

socket.onopen = function() {
    console.log("Соединение установлено.");
};

socket.onclose = function(event) {
    if (event.wasClean) {
        console.log('Соединение закрыто чисто');
    } else {
        setTimeout(startWebsocket, 5000)
        console.log('Обрыв соединения');
    }
    console.log('Код: ' + event.code + ' причина: ' + event.reason);
};

socket.onmessage = function(event) {
    let extStatus = JSON.parse(event.data);
    if (extStatus.id) {
        modifyStatus(extStatus.id);
    } else {
        console.log(extStatus);
        createTable(extStatus);
    }

};

socket.onerror = function(error) {
    console.log("Ошибка " + error.message);
};

setTimeout(() => {
    socket.send('get-infoList');
}, 1000);



let extesion = document.querySelector('#userDropdown');
extesion.innerHTML = `<span class="mr-2 d-none d-lg-inline text-gray-600 small">Добавочный ${localStorage.getItem('extension')}</span>
                        <img class="img-profile rounded-circle" src="https://source.unsplash.com/random/60x60">`;


const modifyStatus = ({ id, status, statustext }) => {
    let extensionId = document.getElementById(`status-blf-${id}`);
    extensionId.removeAttribute('class');
    extensionId.textContent = statusText[statusClass[statustext]];
    extensionId.setAttribute('class', `label ${statusClass[statustext]}`);
};

const addListener = () => {
    document.querySelectorAll('#btnTransfer').forEach(item => {
        item.addEventListener('click', function(event) {
            event.preventDefault();
            console.log(event.target.name);
            console.log(localStorage.getItem('extension'));
            socket.send(JSON.stringify({ 'transfer': { extension: event.target.name, transferExtension: localStorage.getItem('extension') } }));
        });
    });

};

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
            html += `<tr style="background-color: ${result[key][n].backgroundColor};" id=${result[key][n].id}>
                                     <td>${result[key][n].id}</td>
                                     <td>${result[key][n].name}</td>
                                     <td><span style="line-height:20px;" id="status-blf-${result[key][n].id}" class="label ${statusClass[result[key][n].statustext]}">${statusText[statusClass[result[key][n].statustext]]}</span></td>
                                     <td><span style="line-height:20px;" id="status-lds-${result[key][n].id}" class="label label-danger">Не зарегистрирован</span></td>
                                     <td>
                                         <button id="btnTransfer" type="button" name=${result[key][n].id} class="btn btn-success btn-circle btn-sm">V
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
    addListener();

};