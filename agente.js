var socketio = require("socket.io");

var estado = {persiana:false, ac:false};

var serviceURL = document.URL;
serviceURL = serviceURL.substring(0, serviceURL.lastIndexOf('/'));
var socket = io.connect(serviceURL);
socket.on('sensor-update', function(data){
    console.log(data);
    document.getElementById("luminosidad").innerHTML=data.luminosidad;
    document.getElementById("temperatura").innerHTML=data.temperatura;
});

function set_ac(){
    estado.ac = !estado.ac;
    document.getElementById("ac").innerHTML = estado.ac ? 'Encendido' : 'Apagado';
    socket.emit('ac', estado.ac);
}

function set_persiana(){
    estado.persiana = !estado.persiana;
    document.getElementById("persiana").innerHTML = estado.persiana ? 'Subida' : 'Bajada';
    socket.emit('persiana', estado.persiana);
}