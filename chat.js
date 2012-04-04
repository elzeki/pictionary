
var websocket = io.connect("http://localhost:6969");
var user;

$(document).on("ready", iniciar);
function iniciar()
{
	$("#formulario").hide();
	$("#chat").hide();
	$("#lusuarios").hide();
	$("#tmensajes").hide();

	websocket.on("listarnuevousuario", mostrarusuarios);
	websocket.on("nombreDesdeServidor", recibirMensaje);
	$("#formulario").on("submit",enviarMensaje);
	$("#login").on("submit",cargarusuario);
}

function mostrarusuarios(users_server)
{
	
	$("#lusuarios li").remove();
	listausuarios= $("#lusuarios");
	listausuarios.append("<li>" + "Usuarios" + "</li>");
	for (var i = users_server.length - 1; i >= 0; i--) {
	  listausuarios.append("<li>" + users_server[i]["0"]  + "</li>");
	};

	//$("#lusuarios").append("<li>" + lusuarios + "</li>");
}

function cargarusuario(e)
{
   	user = $("#user_name").val();
	$("#user_name_label").text(user + ":");
   	e.preventDefault();
	websocket.emit("nuevoUsuario", user);
	//nombreusuario.val("");
	$("#login").hide();
	$("#formulario").show();
	$("#chat").show();
	$("#lusuarios").show();
	$("#tmensajes").show();
}


function enviarMensaje(e)
{
	var user_name = user;
	var user_text = $("#user_text").val();
	var user_name_and_text = { "0" : user_name, "1" : user_text };
	e.preventDefault();
	websocket.emit("nuevoTexto", user_name_and_text );
	$("#user_text").val("");
}
function recibirMensaje(datosServidor)
{
<<<<<<< HEAD
	$("#tmensajes").append("<tr><td>" + datosServidor["0"] + ": </td><td>" + datosServidor["1"] + "</td></tr>");
}
=======
	$("#lmensajes").append("<li>" + datosServidor["0"] + ": " + datosServidor["1"] + "</li>");
}

>>>>>>> a7e8960a2f1c720fc7a191da500098b7298c4488
