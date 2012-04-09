
var websocket = io.connect("http://localhost:6969");
var user;
var color;

$(document).on("ready", iniciar);

function iniciar()
{   
	color = true;
	$("#formulario").hide();
	$("#chat_interno").hide();

	websocket.on("listarnuevousuario", mostrarusuarios);
	websocket.on("nombreDesdeServidor", recibirMensaje);
	websocket.on("palabra", mostrarpalabra);
	$("#formulario").on("submit",enviarMensaje);
	$("#login").on("submit",cargarusuario);

}

function mostrarusuarios(users_server)
{
	
	$("#lusuarios li").remove();
	listausuarios= $("#lusuarios");
	listausuarios.append("<li>" + "Usuarios|Puntos" + "</li>");
	for (var i = users_server.length - 1; i >= 0; i--) {
	  listausuarios.append("<li>" + users_server[i]["0"]  + "|"+users_server[i]["1"]+ "</li>");
	};
}

function cargarusuario(e)
{
   	user = $("#user_name").val();
	$("#user_name_label").text(user + ":");
   	e.preventDefault();
	websocket.emit("nuevoUsuario", user);
	$("#login").hide();
	$("#formulario").show();
	$("#chat_interno").show();
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
	// style='background:#aaa' 
	if (color){
		$("#tmensajes").append("<tr style='background:#aaa'><td style='width:100px'>" + datosServidor["0"] + ": </td><td style='width:200px'>" + datosServidor["1"] + "</td></tr>");
		color = !color;
	}
	else
	{
		$("#tmensajes").append("<tr style='background:#eee'><td style='width:100px'>" + datosServidor["0"] + ": </td><td style='width:200px'>" + datosServidor["1"] + "</td></tr>");
		color = !color;
	}
}

function mostrarpalabra(palabra)
{
  objpalabra = $("#palabra");
  objpalabra.text(palabra);
}
function reloj()
{
	
}