const { Socket } = require("socket.io");
const io = require("socket.io-client");

var serviceURL = document.URL;
var socket = io.connect(serviceURL);
var estado = {persiana:false, ac:false};

socket.emit('obtener-estado', {});

socket.on('emitir-estado', function(data){
    estado = data;
    document.getElementById("ac").innerHTML = estado.ac ? 'Encendido' : 'Apagado';
    document.getElementById("persiana").innerHTML = estado.persiana ? 'Subida' : 'Bajada';
});

function enviar() {
    var luminosidad = document.getElementById("luminosidad").value;
    var temperatura = document.getElementById("temperatura").value;

    socket.emit('sensores', {luminosidad:luminosidad, temperatura:temperatura});
}