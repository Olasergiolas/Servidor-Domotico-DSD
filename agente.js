const { Socket } = require("socket.io");
const io = require("socket.io-client");

var addr = process.argv.slice(2);
if (addr.length != 2){
    console.log("Uso: node[js] agente.js host port");
    process.exit(-1);
}
var socket = io.connect('http://' + addr[0] + ':' + addr[1]);

socket.on('connect_error', function () {
    console.log("Error de conexión con el servidor");
    process.exit(-1);
});

socket.emit('connect-agent', {});
socket.on('sensores', function(data){
    var temp = parseInt(data.temperatura, 10);
    var luminosidad = parseInt(data.luminosidad, 10);
    var humedad = parseInt(data.humedad, 10);

    if (temp >= 30 && luminosidad >= 80){
        socket.emit("sensores-limite", "Se han sobrepasado los umbrales " +
        "de los sensores, cerrando persianas y encendiendo el aire...");
        socket.emit('persiana', false);
        socket.emit('ac', {on:true, modo:"Frío"});
    }
    
    else if (temp >= 30){
        socket.emit("heat-warning", "Se han sobrepasado los 30ºC, poniendo el aire frío...");
        socket.emit('ac', {on:true, modo:"Frío"});
    }

    else if (temp <= 15){
        socket.emit("heat-warning", "Temperatura por debajo de 15ºC, poniendo el aire caliente...");
        socket.emit('ac', {on:true, modo:"Caliente"});
    }

    else if (humedad >= 50){
        socket.emit("heat-warning", "Humedad por encima del 50%, encendiendo el aire en modo deshumedificador");
        socket.emit('ac', {on:true, modo:"Deshumedificador"});
    }

    else if (luminosidad >= 80){
        socket.emit("brightness-warning", "Se ha excedido el límite de luminosidad");
    }
});

socket.on('emitir-estado', function (data) {
    if (data.ac.on && data.persiana)
        socket.emit("general-warning", "Posible malgasto energético: AC encendido y persiana subida");
});