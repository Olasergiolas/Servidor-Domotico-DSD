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
    console.log(data);
    var temp = parseInt(data.temperatura, 10);
    var luminosidad = parseInt(data.luminosidad, 10)

    if (temp >= 30 && luminosidad >= 80){
        socket.emit("sensores-limite", "Se han sobrepasado los umbrales " +
        "de los sensores, cerrando persianas...");
        socket.emit('persiana', false);
    }
    
    else if (temp >= 30)
        socket.emit("heat-warning", "Se han sobrepasado los 30ºC")

    else if (luminosidad >= 80)
        socket.emit("brightness-warning", "Se ha excedido el límite de luminosidad");
});

socket.on('emitir-estado', function (data) {
    if (data.ac && data.persiana)
        socket.emit("general-warning", "Posible malgasto energético: AC encendido y persiana subida");
    else
        socket.emit("general-warning", "");
});