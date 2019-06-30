/*
 *Source: https://www.pojo.com/harry-potter-spell-list/
 */

var zellen = document.getElementsByTagName("td");
var array = Array.from(zellen);
var charms = [];
var types = [];
var effects = [];

for(var i = 6; i < array.length; i+=3){
  charms.push(array[i].innerHTML);
  types.push(array[i+1].innerHTML);
  effects.push(array[i+2].innerHTML);
}

var spells = {"spell": charms, "type": types, "effect": effects};

//console.log(array[9].innerHTML);
//console.log(spells);

var spelljson = JSON.stringify(spells);
console.log(spelljson);

/* 
* -> nicht sehr elegant, aber den String aus der Ausgabe einfach kopieren 
* und als .json speichern ist am einfachsten
*/