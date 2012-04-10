var websocket = io.connect("http://localhost:6969");
var user;
var color_linea_chat;
var pizarra_canvas;
var pizarra_context;
var color_pincel;

$(document).on("ready", iniciar);

function iniciar()
{   
	color_linea_chat = true; //alterna de true a false para saber de que color pinat la linea
	$("#formulario").hide();
	$("#chat_interno").hide();
	$("#pizarra_completa").hide();

	websocket.on("listarnuevousuario", mostrarusuarios);
	websocket.on("nombreDesdeServidor", recibirMensaje);
	websocket.on("palabra", mostrarpalabra);
	websocket.on("turnousuario", setearturnousuario);
	if($("#turno_usuario").val() != user )
	{
		websocket.on("pizarra_actualizada", recibir_canvas);
	}

	if($("#turno_usuario").val() == user )
	{
		websocket.on("pizarra", enviar_canvas);
	}
	$("#formulario").on("submit",enviarMensaje);
	$("#login").on("submit",cargarusuario);

	setInterval(function() {  enviar_canvas(); }, 1000);

	if(!Modernizr.canvas){
		$("#contenedor_pizarra").style.display = "none";
		}else{
			color_pincel = "#000000";
			document.getElementById("no_html5").style.display = "none";
			pizarra_canvas = document.getElementById("pizarra");
			pizarra_context = pizarra_canvas.getContext("2d");
			pizarra_context.strokeStyle = "#000";
			pizarra_canvas.addEventListener("mousedown",empezarPintar,false);
			pizarra_canvas.addEventListener("mouseup",terminarPintar,false);
			btn_red=$("#buttonRed");
			btn_red.mousedown(function(){ setColor( btn_red.css("background-color"));});
			btn_blue=$("#buttonBlue");
			btn_blue.mousedown(function(){ setColor( btn_blue.css("background-color"));});
			btn_black=$("#buttonBlack");
			btn_black.mousedown(function(){ setColor( btn_black.css("background-color"));});
		}

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
	$("#pizarra_completa").show();
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
	if (color_linea_chat){
		$("#tmensajes").append("<tr style='background:#aaa'><td style='width:100px'>" + datosServidor["0"] + ": </td><td style='width:200px'>" + datosServidor["1"] + "</td></tr>");
		color_linea_chat = !color_linea_chat;
	}
	else
	{
		$("#tmensajes").append("<tr style='background:#eee'><td style='width:100px'>" + datosServidor["0"] + ": </td><td style='width:200px'>" + datosServidor["1"] + "</td></tr>");
		color_linea_chat = !color_linea_chat;
	}
}

function mostrarpalabra(palabra)
{
  objpalabra = $("#palabra");
  objpalabra.text(palabra);
}

//funciones de la pizarra

function setColor(buttonColor){
	color_pincel = buttonColor;
}

	
function empezarPintar(e){
	pizarra_context.beginPath();
	pizarra_context.strokeStyle = color_pincel;
	pizarra_context.moveTo(e.clientX-pizarra_canvas.offsetLeft,e.clientY-pizarra_canvas.offsetTop);
	pizarra_canvas.addEventListener("mousemove",pintar,false)
}

/*
	terminarPintar(e) se ejecuta al soltar el botón izquierdo, y elimina el listener para 
	mousemove
*/

function terminarPintar(e){
	pizarra_canvas.removeEventListener("mousemove",pintar,false);
}
	
/*
	pintar(e) se ejecuta cada vez que movemos el ratón con el botón izquierdo pulsado.
	Con cada movimiento dibujamos una nueva linea hasta la posición actual del ratón en pantalla.
*/

function pintar(e) {
	pizarra_context.lineTo(e.clientX-pizarra_canvas.offsetLeft,e.clientY-pizarra_canvas.offsetTop);
	pizarra_context.stroke();
}
	
/*
	borrar() vuelve a setear el ancho del canvas, lo que produce que se borren los trazos dibujados
	hasta ese momento.
*/

function borrar(){
	pizarra_canvas.width = pizarra_canvas.width;
}

function setearturnousuario(usuario)
{
   $("#turno_usuario").text(usuario);
}

function enviar_canvas()
{
	var pizarra = document.getElementById("pizarra");
	var dataURL = pizarra.toDataURL();
	websocket.emit("pizarra", dataURL );
}

function recibir_canvas(canvas_recibido)
{
	if($("#turno_usuario").val() != user )
	{ 
		loadCanvas(canvas_recibido);
    }
}


function loadCanvas(dataURL){
    var canvas = document.getElementById("pizarra");
    var context = canvas.getContext("2d");
 
    // load image from data url
    var imageObj = new Image();
    imageObj.onload = function(){
        context.drawImage(this, 0, 0);
    };
 
    imageObj.src = dataURL;
}