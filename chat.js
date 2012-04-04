





var websocket = io.connect("http://localhost:6969");

$(document).on("ready", iniciar);
function iniciar()
{
	websocket.on("nombreDesdeServidor", recibirMensaje);
	$("#formulario").on("submit",enviarMensaje);
	$("#login").on("submit",cargarusuario);
	websocket.on("listarnuevousuario", mostrarusuarios);
}

function mostrarusuarios(users_server)
{
	
	$("#lusuarios li").remove();
	listausuarios= $("#lusuarios");
	listausuarios.append("<li>" + "Lista de Usuarios" + "</li>");
	for (var i = users_server.length - 1; i >= 0; i--) {
	  listausuarios.append("<li>" + users_server[i]["0"]  + "</li>");
	};



	//$("#lusuarios").append("<li>" + lusuarios + "</li>");
}

function cargarusuario(e)
{
   var nombreusuario= $("#user_name");
   e.preventDefault();
	websocket.emit("nuevoUsuario", nombreusuario.val());
	nombreusuario.val("");
}


function enviarMensaje(e)
{
	var user_name = $("#user_name_input").val();
	var user_text = $("#user_text").val();
	var user_name_and_text = { "0" : user_name, "1" : user_text };
	e.preventDefault();
	websocket.emit("nuevoNombre", user_name_and_text );
	$("#user_text").val("");
}
function recibirMensaje(datosServidor)
{
	$("#lmensajes").append("<li>" + datosServidor["0"] + ": " + datosServidor["1"] + "</li>");
}