const { Socket } = require("socket.io");
const io = require("socket.io-client");

var estado = {persiana:false, ac:false};
var serviceURL = document.URL;
serviceURL = serviceURL.substring(0, serviceURL.lastIndexOf('/'));
var socket = io.connect(serviceURL);

socket.emit('obtener-estado', {});

socket.on('emitir-estado', function(data){
    estado = data;
    document.getElementById("ac").innerHTML = estado.ac ? 'Encendido' : 'Apagado';
    document.getElementById("persiana").innerHTML = estado.persiana ? 'Subida' : 'Bajada';
});

socket.on('sensor-update', function(data){
    console.log(data);
    document.getElementById("luminosidad").innerHTML=data.luminosidad;
    document.getElementById("temperatura").innerHTML=data.temperatura;
});

socket.on('agent-msg', function(data){
    document.getElementById("agent-msg-container").innerHTML=data;
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