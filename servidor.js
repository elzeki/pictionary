//mejorando.la/node.js/servidor.js
var my_socket = require( "socket.io" ).listen( 6969 );
var lusuarios = [];
var diccionario = [];
var turnousuario = 0;
var indicediccionario = 0;
var timer;
var puntos_disponibles=10;
var primer_acierto = false;
var ultimos_seg=10;
var control_usuarios =0;
var tiempodelreloj=4000; // tiempo para responder al enigma;
my_socket.sockets.on( "connection", arranque );
setear_tiempo();

/* ------------------------------------------------------------------------*/
function arranque( usuario )
{	           
  usuario.on( "nuevoTexto", sumar_puntos );
	usuario.on( "nuevoTexto", emitir );
	usuario.on( "nuevoUsuario", cargar_user );
  usuario.on( "pizarra", recibir_pizarra );
  usuario.on( "estoy_vivo", envejesimiento );
  cargar_diccionario();
	mostrar_palabra();


}
/* ------------------------------------------------------------------------*/ 
function cargar_user( data )
{  
 // var user_name = data;
  //var point = 0;
  //var objeto = { "0" : user_name, "1" : point };
  
  var objeto = { "0": data, "1": 0, "2": control_usuarios }
  lusuarios[ lusuarios.length ] = objeto;
  my_socket.sockets.emit( "listarnuevousuario", lusuarios );
//  console.log(lusuarios);
  emitir_turno();
}
/* ------------------------------------------------------------------------*/
function emitir( data )
{
  my_socket.sockets.emit( "nombreDesdeServidor", data );
}
/* ------------------------------------------------------------------------*/
function asignar_puntos_usuario( nombreusuario )
{
   var tope =  lusuarios.length;
   var i = 0;
   var seguir = true;
    while ( i < tope && seguir )
     { 
      if ( lusuarios[ i ][ "0" ] == nombreusuario )
      {  
        lusuarios[ i ][ "1" ]=lusuarios[ i ][ "1" ] + puntos_disponibles;
        seguir = false; 
      }
      else { ++i; }
    }
}
/* ------------------------------------------------------------------------*/
function  sumar_puntos( data )
{  	
     textousuario = data[ "1" ];

     if (textousuario  == diccionario[ indicediccionario ] )
     {  nombreusuario = data[ "0" ];
        bloquear_usuario_ganador( nombreusuario );
        asignar_puntos_usuario ( nombreusuario );
        descontar_puntos_por_acierto();
        
        if ( primer_acierto == false)
        { detener_timer();
          detener_timer_clientes();
          primer_acierto = true;
          setTimeout(function() { retomar_juego(); }, 10000);
          ultimos_segundos( ultimos_seg );
        }
     }
}

/* ------------------------------------------------------------------------*/
function retomar_juego()
{ ultimos_seg =  
  cambiar_palabra();
  cambiar_turno();
  setear_tiempo();
  emitir_turno();
  mostrar_palabra();
  iniciar_timer_clientes();
}
/* ------------------------------------------------------------------------*/
function mostrar_palabra()
{
   my_socket.sockets.emit( "palabra", diccionario[ indicediccionario ] );  
   puntos_disponibles = 10;
}
/*------------------------------------------------------------------------------- */
function setear_tiempo()
{   
    timer = setInterval( 
      function() {    
        primer_acierto=false;
        ++control_usuarios;
        eliminar_user_envejesimiento();
        sumar_control_usuarios();
        cambiar_palabra();
        cambiar_turno();
        emitir_turno()
        iniciar_timer_clientes();
        if ( indicediccionario > diccionario.length ){ indicediccionario = 0; }
        mostrar_palabra( diccionario[ indicediccionario ] );
        }
      ,tiempodelreloj);
  }
    
/*------------------------------------------------------------------------------- */
function cambiar_turno()
{ var auxtope = lusuarios.length;
  ++turnousuario;
  if ( ( turnousuario + 1 ) > auxtope ) 
  {
   turnousuario = 0;
  }
}
/*------------------------------------------------------------------------------- */
function emitir_turno()
{  if ( lusuarios.length > 0 )
   {
      my_socket.sockets.emit( "turnousuario", lusuarios[ turnousuario ][ 0 ], lusuarios);
   }
}
/*------------------------------------------------------------------------------- */
function cambiar_palabra()
{
  indicediccionario = Math.floor ( diccionario.length * Math.random() );
}
/*------------------------------------------------------------------------------- */
function detener_timer()
{
  clearInterval( timer );  
}
/*------------------------------------------------------------------------------- */
function cargar_diccionario()
{ 
  diccionario = [ "a", "agua", "triangulo", "pera", "manzana", "banana", "casa", "auto", "computadora", "mesa", "silla", "guante"
                , "pelota", "heladera", "monitor", "lapicera", "anteojos", "reloj", "azucar", "teclado", "empresa"];
}
/*------------------------------------------------------------------------------- */
function recibir_pizarra( data )
{
  my_socket.sockets.emit( "pizarra_actualizada", data );
}
/*------------------------------------------------------------------------------- */
function iniciar_timer_clientes()
{  
 my_socket.sockets.emit("seteartiemporeloj", tiempodelreloj / 1000);
}
/*------------------------------------------------------------------------------- */
function detener_timer_clientes()
{  console.log("deteniendo desde el servidor");
 my_socket.sockets.emit("detener_tiempo_reloj");
}
/*------------------------------------------------------------------------------- */
function bloquear_usuario_ganador( nombreusuario )
{
  my_socket.sockets.emit("bloquear_usuario_ganador", nombreusuario);
}
/*------------------------------------------------------------------------------- */
function descontar_puntos_por_acierto()
{
   --puntos_disponibles;
}
/*------------------------------------------------------------------------------- */
function ultimos_segundos( segundos )
{ 
  my_socket.sockets.emit("ultimos_segundos", segundos);
}
/*------------------------------------------------------------------------------- */
function envejesimiento ( user_name )
{
   var tope =  lusuarios.length;
   var i = 0;
   var seguir = true;
    while ( i < tope && seguir )
     { 
      if ( lusuarios[ i ][ "0" ] == user_name )
      {  
        lusuarios[ i ][ "2" ]=lusuarios[ i ][ "2" ] + 1;
        seguir = false; 
      }
      else { ++i; }
    }

}
/*------------------------------------------------------------------------------- */
function sumar_control_usuarios()
{

 my_socket.sockets.emit("sumar_control");
}
/*------------------------------------------------------------------------------- */
function eliminar_user_envejesimiento()
{
   var tope =  lusuarios.length;
   var i = 0;
    while ( i < tope )
     { 
      if (  (control_usuarios -  lusuarios[ i ][ "2" ]) > 1  )
      {  
        lusuarios.splice(i,1);
        --tope;
      }
      else {++i;}
    }
}