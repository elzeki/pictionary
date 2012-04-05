//mejorando.la/node.js/servidor.js
var cvanderito = require("socket.io").listen(6969);
var lusuarios=[];
var diccionario;
var indicediccionario=0;
var timer;
cvanderito.sockets.on("connection", arranque);
seteartiempo();
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
{	usuario.on("nuevoTexto", sumarpuntos);
	usuario.on("nuevoTexto", emitir);
	usuario.on("nuevoUsuario",cargaruser);
  cargardiccionario();
	mostrarpalabra();
}
/* ------------------------------------------------------------------------*/
function emitir(data)
{  	cvanderito.sockets.emit("nombreDesdeServidor",data);
}
/* ------------------------------------------------------------------------*/
function asignarpuntosusuario(nombreusuario)
{
   var tope =  lusuarios.length;
   var i=0;
   var seguir= true;
   console.log(tope);
   
    while (i< tope && seguir)
     { //console.log("user=>"+lusuarios[i]["0"]);
      if (lusuarios[i]["0"]==nombreusuario)
      {  console.log("si");
        ++lusuarios[i]["1"];
        seguir=false; 
      }
      else { ++i; console.log("noo");}
    }
}
/* ------------------------------------------------------------------------*/
function  sumarpuntos(data)
{  	 nombreusuario = data["0"];
     textousuario = data["1"];

     if (textousuario  == diccionario[indicediccionario] )
     {  console.log("nombre:"+nombreusuario+"-"+"texto:"+textousuario);
        asignarpuntosusuario (nombreusuario);
        //lusuarios[0]["1"]=lusuarios[0]["1"] + 1;
        reiniciartimer();
        cambiarpalabra();
        mostrarpalabra();
        seteartiempo();
     }
     cvanderito.sockets.emit("listarnuevousuario",lusuarios);
}
/* ------------------------------------------------------------------------*/
function mostrarpalabra()
{
   cvanderito.sockets.emit("palabra",diccionario[indicediccionario]);  
}
/*------------------------------------------------------------------------------- */
function seteartiempo()
{
    timer=setInterval(function() {     
    cambiarpalabra();
    if (indicediccionario > diccionario.length ){ indicediccionario =0;}
    mostrarpalabra(diccionario[indicediccionario]);
  },11500);}
/*------------------------------------------------------------------------------- */
function cambiarpalabra()
{
  var random = Math.floor (diccionario.length * Math.random ());
  //console.log(random);
  indicediccionario=random;
}
/*------------------------------------------------------------------------------- */
function reiniciartimer()
{
  clearInterval(timer);  
}
/*------------------------------------------------------------------------------- */
function cargardiccionario()
{ 
  diccionario = ["triangulo","pera","manzana","banana","casa","auto","computadora","mesa","silla","guante","pelota","heladera","monitor","lapicera","anteojos","reloj","azucar","teclado","empresa"];
}