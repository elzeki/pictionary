//mejorando.la/node.js/servidor.js
var cvanderito = require("socket.io").listen(6969);
var lusuarios=[];



cvanderito.sockets.on("connection", arranque);
/* ------------------------------------------------------------------------*/
function cargaruser(data)
{  
    var user_name=data;
    var point=0;
	var objeto = { "0" : user_name, "1" : point };
  lusuarios[lusuarios.length] = objeto;
  cvanderito.sockets.emit("listarnuevousuario",lusuarios);
}
/* ------------------------------------------------------------------------*/
function arranque(usuario)
{	usuario.on("nuevoNombre", emitir);
	usuario.on("nuevoUsuario",cargaruser);
}
/* ------------------------------------------------------------------------*/
function emitir(data)
{  	cvanderito.sockets.emit("nombreDesdeServidor",data);
}
/* ------------------------------------------------------------------------*/

 /* ------------------------------------------------------------------------*/