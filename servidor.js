//mejorando.la/node.js/servidor.js
var cvanderito = require( "socket.io" ).listen( 6969 );
var lusuarios = [];
var diccionario = [];
var turnousuario = 0;
var indicediccionario = 0;
var timer;
var tiempodereloj;
cvanderito.sockets.on( "connection", arranque );
seteartiempo();

/* ------------------------------------------------------------------------*/
function arranque( usuario )
{	usuario.on( "nuevoTexto", sumarpuntos );
	usuario.on( "nuevoTexto", emitir );
	usuario.on( "nuevoUsuario", cargaruser );
  usuario.on( "pizarra", recibir_pizarra );

  cargardiccionario();
	mostrarpalabra();

}
/* ------------------------------------------------------------------------*/ 
function cargaruser( data )
{  
  var user_name = data;
  var point = 0;
  var objeto = { "0" : user_name, "1" : point };
  lusuarios[ lusuarios.length ] = objeto;
  cvanderito.sockets.emit( "listarnuevousuario", lusuarios );
  emitirturno();
}
/* ------------------------------------------------------------------------*/
function emitir( data )
{
  cvanderito.sockets.emit( "nombreDesdeServidor", data );
}
/* ------------------------------------------------------------------------*/
function asignarpuntosusuario( nombreusuario )
{
   var tope =  lusuarios.length;
   var i = 0;
   var seguir = true;
    while ( i < tope && seguir )
     { 
      if ( lusuarios[ i ][ "0" ] == nombreusuario )
      {  
        ++lusuarios[ i ][ "1" ];
        seguir = false; 
      }
      else { ++i; }
    }
}
/* ------------------------------------------------------------------------*/
function  sumarpuntos( data )
{  	 nombreusuario = data[ "0" ];
     textousuario = data[ "1" ];

     if (textousuario  == diccionario[ indicediccionario ] )
     {  asignarpuntosusuario ( nombreusuario );
        reiniciartimer();
        cambiarpalabra();
        cambiarturno();
        seteartiempo();
        emitirturno();
        mostrarpalabra();
     }
}
/* ------------------------------------------------------------------------*/
function mostrarpalabra()
{
   cvanderito.sockets.emit( "palabra", diccionario[ indicediccionario ] );  
}
/*------------------------------------------------------------------------------- */
function seteartiempo()
{   
    

    timer = setInterval( 
      function() {    
        
        cambiarpalabra();
        cambiarturno();
        emitirturno()
        mandarpulsoreloj();
        if ( indicediccionario > diccionario.length ){ indicediccionario = 0; }
        mostrarpalabra( diccionario[ indicediccionario ] );
        }
      ,60000);
  }
    
/*------------------------------------------------------------------------------- */
function cambiarturno()
{ var auxtope = lusuarios.length;
  ++turnousuario;
  if ( ( turnousuario + 1 ) > auxtope ) 
  {
   turnousuario = 0;
  }
}
/*------------------------------------------------------------------------------- */
function emitirturno()
{  if ( lusuarios.length > 0 )
   {
      cvanderito.sockets.emit( "turnousuario", lusuarios[ turnousuario ][ 0 ], lusuarios);
   }
}
/*------------------------------------------------------------------------------- */
function cambiarpalabra()
{
  var random = Math.floor ( diccionario.length * Math.random() );
  indicediccionario = random;

}
/*------------------------------------------------------------------------------- */
function reiniciartimer()
{
  clearInterval( timer );  
}
/*------------------------------------------------------------------------------- */
function cargardiccionario()
{ 
  diccionario = [ "triangulo", "pera", "manzana", "banana", "casa", "auto", "computadora", "mesa", "silla", "guante"
                , "pelota", "heladera", "monitor", "lapicera", "anteojos", "reloj", "azucar", "teclado", "empresa"];
}
/*------------------------------------------------------------------------------- */
function recibir_pizarra( data )
{
  cvanderito.sockets.emit( "pizarra_actualizada", data );
}
/*------------------------------------------------------------------------------- */

function mandarpulsoreloj()
{  
 cvanderito.sockets.emit("seteartiemporeloj",0);
}