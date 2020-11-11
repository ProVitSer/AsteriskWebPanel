let table = document.querySelector('.table-responsive'),
    extensionsTable = document.createElement('table');
extensionsTable.className = "table table-hover";


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

const startWebsocket = () => {
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
            createTable(extStatus);
        }

    };

    socket.onerror = function(error) {
        console.log("Ошибка " + error.message);
    };

    setTimeout(() => {
        socket.send('get-infoList');
    }, 1000);
}

startWebsocket();

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

const createTable = (extStatus) => {
    extensionsTable.innerHTML =
        `<tr>
            <th>Внутренний</th>
            <th>Имя</th>
            <th>BLF</th>
            <th>LDS</th>
            <th>Перевод</th>
        </tr>`

    for (key in extStatus) {
        // console.log(extStatus[key]);
        extensionsTable.innerHTML +=
            `<tr id=${key}>
                <td>${key}</td>
                <td>${extStatus[key].name}</td>
                <td><span id="status-blf-${key}" class="label ${statusClass[extStatus[key].statustext]}">${statusText[statusClass[extStatus[key].statustext]]}</span></td>
                <td><span id="status-lds-${key}" class="label label-danger">Не зарегистрирован</span></td>
                <td>
                    <button id="btnTransfer" type="button" name=${key} class="btn btn-success btn-circle btn-sm">V
                    </button>
                </td>
            </tr>`
        table.append(extensionsTable);
    };
    addListener();

};