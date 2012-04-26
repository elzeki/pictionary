var websocket = io.connect("http://localhost:6969");
var user;
var color_linea_chat = true; //alterna de true a false para saber de que color pinta la linea
var pizarra_canvas;
var pizarra_context;
var color_pincel;
var timerreloj;
var reloj_canvas;

$(document).on("ready", iniciar);
 
function iniciar()
{  
	if( !Modernizr.canvas )
	{
		$("#contenedor_pizarra").style.display = "none";
	}
	else
	{
		$("#formulario").hide();
		$("#chat_interno").hide();
		$("#pizarra_completa").hide();
		$("#turno_usuario").hide();

		websocket.on("listarnuevousuario", mostrarusuarios);
		websocket.on("nombreDesdeServidor", recibirMensaje);
		websocket.on("palabra", mostrarpalabra);
		websocket.on("turnousuario", setearturnousuario);
		websocket.on("seteartiemporeloj", seteartiemporeloj);
		websocket.on("detener_tiempo_reloj",detener_tiempo_reloj);
		websocket.on("ultimos_segundos", ultimos_segundos);
		websocket.on("bloquear_usuario_ganador", bloquear_usuario_ganador);
		
		$("#formulario").on("submit",enviarMensaje);
		
		if($("#turno_usuario").text() != user )
		{	
			websocket.on("pizarra_actualizada", recibir_canvas);
		 }
		else
		{	
			websocket.on("pizarra", enviar_canvas);
		}

		$("#login").on("submit",cargarusuario);

		color_pincel = "#000000";
		document.getElementById("no_html5").style.display = "none";
		pizarra_canvas = document.getElementById("pizarra");
		pizarra_context = pizarra_canvas.getContext("2d");
		pizarra_context.strokeStyle = "#000";
		pizarra_canvas.addEventListener("mousedown",empezarPintar,false);
		pizarra_canvas.addEventListener("mouseup",terminarPintar,false);
		pizarra_canvas.addEventListener("mouseup",enviar_canvas,false);

		$(".botonera").mousedown(function(){ setColor( $(this).css("background-color"));});
	}
}

function mostrarusuarios(users_server)
{
	$("#lusuarios tr").remove();
	listausuarios= $("#lusuarios");
	listausuarios.append("<tr><td>Usuarios</td><td>Puntos</td></tr>");

	for (var i = users_server.length - 1; i >= 0; i--) {
			if (users_server[i]["0"] == $("#turno_usuario").text())
		{
			listausuarios.append("<tr style='font-weight: bold; background:yellow;'><td>" + users_server[i]["0"] +"</td><td>" + users_server[i]["1"]+ "</td></tr>");
		}
		else {
			listausuarios.append("<tr><td>" + users_server[i]["0"] +"</td><td>" + users_server[i]["1"]+ "</td></tr>");
		}
	};

	var objpalabra = $("#palabra");
	if( user == $("#turno_usuario").text() )
	{	
		objpalabra.css({visibility: 'visible'});
	}
	else
	{	
		objpalabra.css({visibility: 'hidden'});
		//objpalabra.text("no te importa!");
	}
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
	$("#turno_usuario").show();
	//seteartiemporeloj(0);  /* quit me only for test*/

	var objpalabra = $("#palabra");
	if( user == $("#turno_usuario").text() )
	{	
		objpalabra.css({visibility: 'visible'});
	}
	else
	{	
		objpalabra.css({visibility: 'hidden'});
		//objpalabra.text("no te importa!");
	}
}

function enviarMensaje(e)
{
	var user_text = $("#user_text").val();
	var user_name_and_text = { "0" : user, "1" : user_text };
	e.preventDefault();
	websocket.emit("nuevoTexto", user_name_and_text );
	$("#user_text").val("");
	
}
function recibirMensaje(datosServidor)
{
	//tengo que sacar la variable color_linea_chat pero no se como
	if (color_linea_chat){
		$("#tmensajes").append("<tr style='background:#aaa'><td style='width:100px'>" + datosServidor["0"] + ": </td><td style='width:200px'>" + datosServidor["1"] + "</td></tr>");
		color_linea_chat = !color_linea_chat;
	}
	else
	{
		$("#tmensajes").append("<tr style='background:#eee'><td style='width:100px'>" + datosServidor["0"] + ": </td><td style='width:200px'>" + datosServidor["1"] + "</td></tr>");
		color_linea_chat = !color_linea_chat;
	}

	$("#chat").scrollTop( document.getElementById('chat').scrollHeight );
}

function mostrarpalabra(palabra)
{
  var objpalabra = $("#palabra");
  objpalabra.text(palabra);
  
	if( user == $("#turno_usuario").text() )
	{	
		objpalabra.css({visibility: 'visible'});
	}
	else
	{	
		objpalabra.css({visibility: 'hidden'});
		objpalabra.text("no te importa!");
	}
}

//funciones de la pizarra ***************************************************************************

function setColor(buttonColor){
	color_pincel = buttonColor;
}

function empezarPintar(e){
	if($("#turno_usuario").text() == user )
	{
		se_modifico_pizarra = true;
		pizarra_context.beginPath();
		pizarra_context.strokeStyle = color_pincel;
		pizarra_context.moveTo(e.clientX-pizarra_canvas.offsetLeft, e.clientY-pizarra_canvas.offsetTop);
		pizarra_canvas.addEventListener("mousemove", pintar, false)
	}
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
	if($("#turno_usuario").text() == user )
	{
		pizarra_context.lineTo(e.clientX-pizarra_canvas.offsetLeft,e.clientY-pizarra_canvas.offsetTop);
		pizarra_context.stroke();
	}
}
	
/*
	borrar() vuelve a setear el ancho del canvas, lo que produce que se borren los trazos dibujados
	hasta ese momento.
*/

function borrar(canvas){
	pizarra_canvas.width = pizarra_canvas.width;
	enviar_canvas();
}

//***************************************************************************************************

function setearturnousuario(usuario, users_server)
{   
	var objpalabra = $("#palabra");
   $("#turno_usuario").text(usuario);

	if( user == $("#turno_usuario").text() )
	{	
		objpalabra.css({visibility: 'visible'});
	}
	else
	{	
		objpalabra.css({visibility: 'hidden'});
		//objpalabra.text("no te importa!");
	}
   $("#lusuarios tr").remove();
	listausuarios= $("#lusuarios");

	listausuarios.append("<tr><td>Usuarios</td><td>Puntos</td></tr>");

	for (var i = users_server.length - 1; i >= 0; i--) {
		if (users_server[i]["0"] == $("#turno_usuario").text())
		{
			listausuarios.append("<tr style='font-weight: bold; background:yellow;'><td>" + users_server[i]["0"] +"</td><td>" + users_server[i]["1"]+ "</td></tr>");
		}
		else 
		{
			listausuarios.append("<tr><td>" + users_server[i]["0"] +"</td><td>" + users_server[i]["1"]+ "</td></tr>");
		}
	};
	borrar();

	if( $("#turno_usuario").text() == user)
	{
		$("#formulario input").attr("disabled","disabled");
	}
	else
	{
		$("#formulario input").removeAttr("disabled");
	}
}

function enviar_canvas()
{
	if($("#turno_usuario").text() == user )
	{ 
		var pizarra = document.getElementById("pizarra");
		var dataURL = pizarra.toDataURL();
		websocket.emit("pizarra", dataURL );
		se_modifico_pizarra = false;
		$("#pizarra").removeAttr("disabled");
	}
}

function recibir_canvas(canvas_recibido)
{
	if($("#turno_usuario").text() != user )
	{
		borrar();
		loadCanvas(canvas_recibido);
	}
	$("#pizarra").attr("disabled","disabled");
}

function loadCanvas(dataURL){
	var canvas = document.getElementById("pizarra");
	var context = canvas.getContext("2d");
 
	var imageObj = new Image();
	imageObj.onload = function(){
		context.drawImage(this, 0, 0);
	};
 
	imageObj.src = dataURL;
}


function comenzar(turno_usuario){

	if( user == $("#turno_usuario").text() )
	{	
		objpalabra.css({visibility: 'visible'});
	}
	else
	{	
		objpalabra.css({visibility: 'hidden'});
		objpalabra.text("no te importa!");
	}

	if( user != $("#turno_usuario").text() ){ $("#formulario input").removeAttr("disabled"); }
}

function detener_tiempo_reloj()
{
	clearInterval( timerreloj );

}

function seteartiemporeloj(i, ultimos_segundos)
{
	reloj_canvas = document.getElementById("reloj");
	lienzo = reloj_canvas.getContext("2d");
	reloj_canvas.width=reloj_canvas.width;
	color="rgb(51,255,102)";
	dibujar_reloj(lienzo,color);
	clearInterval(timerreloj);
	if (ultimos_segundos) // cuenta regresiva de 10 a 0 
	{  
	  timerreloj=setInterval( 
	  function() {    
		--i;
		if (i>= 0)
		 {seteartiemporestante(lienzo,i);}
		}
	  ,1000);  		
	}
	else   // cuenta de 0 a 60
	{
		timerreloj=setInterval( 
		  function() {    
			++i;
			 seteartiemporestante(lienzo,i);
			}
		  ,1000);
	}
}


function seteartiemporestante(reloj_canvas,i)
{	

	auxi=i;
	if (i<10) {i="0"+i;	}
	if (i>=58)  { auxi=i+4; }
	if (i ==33)  
		{ 
			color="rgb(255,0,0)"; 
			circulo2y3(lienzo,color);
		}

	/* circulo 1 el negro*/
	lienzo.beginPath();
	lienzo.fillStyle="rgb(0,0,0)";
	lienzo.arc(54,54,37,0,Math.PI*2,true);
	lienzo.fill();

	/* circulo dinamico*/
	lienzo.beginPath();
	lienzo.strokeStyle=color;
	lienzo.lineWidth = 10;    
	lienzo.arc(54,54,45,-Math.PI/2  ,-Math.PI/2 + (auxi/10)  ,false);
	lienzo.stroke()
	 
	/* numeros*/ 	
	lienzo.fillStyle=color;
	lienzo.font="bold 59px Arial";
	lienzo.fillText(i,20,75);
}

function dibujar_reloj(lienzo, color)
{
	/* fondo dinamico  el verde clarito*/ 
	lienzo.beginPath();
	lienzo.strokeStyle="rgb(0, 104, 139)";
	lienzo.lineWidth = 5;    
	lienzo.arc(54,54,45,0  ,Math.PI *2  ,false);
	lienzo.stroke();
	
	
   circulo2y3(lienzo,color);
}

function circulo2y3 (lienzo,color)
{
	/* circulo 3*/
	lienzo.beginPath();
	lienzo.strokeStyle=color;
	lienzo.lineWidth = 4;  
	lienzo.arc(54,54,50,0,Math.PI*2 ,true);
	lienzo.stroke();

	 /* circulo 2*/
	lienzo.beginPath();
	lienzo.lineWidth = 4;  
	lienzo.strokeStyle=color;
	lienzo.arc(54,54,40,0,Math.PI*2 ,true);
	lienzo.stroke();

}
function ultimos_segundos( segundos )
{
   seteartiemporeloj( segundos, true );
}

function bloquear_usuario_ganador( usuario_bloqueado )
{
	if(usuario_bloqueado == user )
	{
		$("#formulario input").attr("disabled","disabled");	
	}
}