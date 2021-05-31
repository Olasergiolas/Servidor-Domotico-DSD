var http = require("http");
var url = require("url");
var fs = require("fs");
var path = require("path");
var socketio = require("socket.io");
var mimeTypes = { "html": "text/html", "jpeg": "image/jpeg", "jpg": "image/jpeg", "png": "image/png", "js": "text/javascript", "css": "text/css", "swf": "application/x-shockwave-flash"};
var MongoClient = require('mongodb').MongoClient;
var MongoServer = require('mongodb').Server;

var httpServer = http.createServer(
	function(request, response) {
		var uri = url.parse(request.url).pathname;
		if (uri=="/") uri = "/sensores.html";
		else if (uri=="/userpanel") uri = "/userPanel.html";
		var fname = path.join(process.cwd(), uri);
		fs.exists(fname, function(exists) {
			if (exists) {
				fs.readFile(fname, function(err, data){
					if (!err) {
						var extension = path.extname(fname).split(".")[1];
						var mimeType = mimeTypes[extension];
						response.writeHead(200, mimeType);
						response.write(data);
						response.end();
					}
					else {
						response.writeHead(200, {"Content-Type": "text/plain"});
						response.write('Error de lectura en el fichero: '+uri);
						response.end();
					}
				});
			}
			else{
				console.log("Peticion invalida: "+uri);
				response.writeHead(200, {"Content-Type": "text/plain"});
				response.write('404 Not Found\n');
				response.end();
			}
		});		
	}
);

var estado = {persiana:false, ac:false};
var agente;

var db_url = "mongodb://localhost:27017/";
MongoClient.connect(db_url, { useUnifiedTopology: true }, function(err, db) {
	if (err) throw err;
	httpServer.listen(8080);
	var io = socketio(httpServer);

	var dbo = db.db("P4");
	dbo.createCollection("sensores", function(err, res){
		var collection = res;
		if (err){
			collection = dbo.collection("sensores");
			if (collection === undefined) throw err;
		}
		

		io.sockets.on('connection', function(client) {
			console.log("CONEXIÓN");
			client.on('sensores', function(data){
				io.sockets.emit('sensor-update', data);
				data.timestamp = new Date();
				collection.insertOne(data);
				console.log(data);

				if (agente !== undefined)
					agente.emit('sensores', data);
			});
			client.on('persiana', function(data){
				estado.persiana = data;
				io.sockets.emit('emitir-estado', estado);
				console.log(estado);
			});

			client.on('ac', function(data){
				estado.ac = data;
				io.sockets.emit('emitir-estado', estado);
				console.log(estado);
			});

			client.on('obtener-estado', function(){
				client.emit('emitir-estado', estado);
			});

			client.on('connect-agent', function(data) {
				console.log("Agente conectado");
				agente = client;
				client.on('disconnect', function(){
					agente = undefined;
					console.log("Agente desconectado");
				})
			});

			client.on('sensores-limite', function (data) {
				io.sockets.emit('agent-msg', data);
				console.log(data);
			});

			client.on('heat-warning', function (data) {
				io.sockets.emit('agent-msg', data);
				console.log(data);
			});

			client.on('brightness-warning', function (data) {
				io.sockets.emit('agent-msg', data);
				console.log(data);
			});

			client.on('obtener-registro', function (){
				//client.emit('emitir-registro', collection.find());

				collection.find().toArray(function(err, results){
					client.emit('emitir-registro', results);
				});

				//console.log(run(collection));
			})
		})
	});


	console.log("Servicio HTTP iniciado");
});

async function run(collection) {
	res = [];
	const cursor = collection.find();
	while (await cursor.hasNext()) {
		res.push(await cursor.next());
	  //console.log(await cursor.next());
	}
	return res;
  }
