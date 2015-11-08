var markers = [];
window.debug = true;
$(function(){
const greetings = [
    'Hi',
    'Hello',
    'Welcome',
    'Bonjour',
    'Tervetuloa',
    'Välkommen',
    'hey',
    'Greetings',
    'أهلا بك'
];
const fonts = [
  "Roboto",
  "Droid Sans",
  "Lobster",
  "Pacifico",
  "Architects Daughter",
];
function getGreeting(){
	return greetings[Math.floor(Math.random() * greetings.length)];
}
function getFont() {
  return fonts[Math.floor(Math.random() * fonts.length)];
}
$( window ).resize(updateHeight);
/*   change to divIcon     */
var markerIcon = L.icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjMDAwMDAwIiBoZWlnaHQ9IjI0IiB2aWV3Qm94PSIwIDAgMjQgMjQiIHdpZHRoPSIyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxwYXRoIGQ9Ik0xMiAyQzguMTMgMiA1IDUuMTMgNSA5YzAgNS4yNSA3IDEzIDcgMTNzNy03Ljc1IDctMTNjMC0zLjg3LTMuMTMtNy03LTd6bTAgOS41Yy0xLjM4IDAtMi41LTEuMTItMi41LTIuNXMxLjEyLTIuNSAyLjUtMi41IDIuNSAxLjEyIDIuNSAyLjUtMS4xMiAyLjUtMi41IDIuNXoiLz4KICAgIDxwYXRoIGQ9Ik0wIDBoMjR2MjRIMHoiIGZpbGw9Im5vbmUiLz4KPC9zdmc+',
  	iconRetinaUrl: 'data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjMDAwMDAwIiBoZWlnaHQ9IjQ4IiB2aWV3Qm94PSIwIDAgMjQgMjQiIHdpZHRoPSI0OCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxwYXRoIGQ9Ik0xMiAyQzguMTMgMiA1IDUuMTMgNSA5YzAgNS4yNSA3IDEzIDcgMTNzNy03Ljc1IDctMTNjMC0zLjg3LTMuMTMtNy03LTd6bTAgOS41Yy0xLjM4IDAtMi41LTEuMTItMi41LTIuNXMxLjEyLTIuNSAyLjUtMi41IDIuNSAxLjEyIDIuNSAyLjUtMS4xMiAyLjUtMi41IDIuNXoiLz4KICAgIDxwYXRoIGQ9Ik0wIDBoMjR2MjRIMHoiIGZpbGw9Im5vbmUiLz4KPC9zdmc+',
  	iconSize: [24, 40],
  	iconAnchor: [14, 40],
});

var youAreHere = L.divIcon({
  html: '<i class="youarehere material-icons">&#xE8B4;</i>'
});

var youAreHereCOORDS = null;

/*
  Hello message
*/
$('div').append('<h1 class="hi">'+getGreeting()+'</h1>').css('font-family', ""+getFont());

/*
  Always good to have hard coded magic numbers
*/
function updateHeight(){
	$('#map').height($(window).height()-4);
}

$('.hi').add(""+getGreeting());

/*
	Remove object after anim.
    Create object after anim.

	Optimization required:
    	- Load map crap background while greeting displayed
*/

$(".hi").bind("animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd", function(){
	$(".hi").remove();
    $('div').append('<div id="map"/>');
	  updateHeight();
    init(true);
});

function init(debug){
    var tileURL = 'http://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png';
    window.L = L;
	  window.map = L.map('map').setView([60.1708, 24.9375], 10);
	  L.tileLayer(tileURL, {	attribution: 'Map data &copy;  http://wiki.openstreetmap.org/wiki/Tile_servers', maxZoom: 18,}).addTo(map);

    navigator.geolocation.getCurrentPosition(function(a){
        L.marker([a.coords.latitude, a.coords.longitude], {icon: youAreHere}).addTo(map);
        map.setView([a.coords.latitude, a.coords.longitude],14)
    });

    getEvents();

}

function getEvents(){
// 'page_size':9999,
  $.getJSON('http://api.hel.fi/linkedevents/v0.1/event/',
  	{
    'start':'today',
    'end':'today',
    'include':'location'
    }, handleEvents )
}
function handleEvents(object) {
  const events = object.data;
  events.map(
    function(val, i){
      // title: event title
      // closed event? opacity 50%
      const markerText = '<br/><b class="markerTitle">'+ (val.name.fi || val.name.en) + '</b><br/><br/>'
                        +'<i name="marker-'+i+'" onclick="handleFavoriteClick(this)" class="favorite material-icons">&#xE87D;</i>'
                        +'<i class="markerExit material-icons">&#xE879;</i>';
      const _event = objToEvent(val);

      markers.push({
          marker: L.marker(_event.coords, {icon: markerIcon})
                  .addTo(map)
                  .bindPopup(markerText)
                  .on('click', markerClickHandler),
          _event: _event,
          i: i
        });
    }
  );
  function objToEvent(obj){
    const pos = obj.location.position;
    const coords = pos.coordinates;
    return {
      name: obj.name,
      position: pos,
      coords: [coords[1], coords[0]],
    }
  }
}

}); /* end of $ document ready */

function handleFavoriteClick(element){
  const color = $(element).css('color') === 'rgb(205, 92, 92)' ? 'lightgray' : 'indianred';
  if(color === 'indianred') Materialize.toast('Favorited!', 1000)
  else Materialize.toast('Removed :(!', 1000)
  $(element).css('color', color);

  /*
    Lazy dev...
  */
  const markerIndex = $(element)[0].attributes.name.value.split('-')[1];
  handleFavoritesList(markerIndex);

}

function handleFavoritesList(i){
  const listElem = $('.fav ul');
  listElem.append('<li>'+markers[i]['_event'].name.fi+'</li>')
  console.log(markers[i])
}

function markerClickHandler(a,b,c){
  var options = {
    fromPlace: "60.1605403,24.9345752",
    mode: "WALK,TRANSIT",
    numItineraries: "3",
    showIntermediateStops: "true",
    time: "17:00",
    locale: 'en',
    date: new Date(),
    toPlace: "62.1605403,24.9345752"
  }
  //?fromPlace=60.1618799%2C24.939345
  // toPlace=60.249927%2C25.22218
  // mode=WALK%2CTRANSIT
  // numItineraries=3
  // showIntermediateStops=true
  // locale=en
  // date=2015%2F11%2F07
  // time=17%3A00

    $.getJSON('http://144.76.78.72/otp/routers/default/plan', options, handleRoute )

  function handleRoute(data){
    console.log(data)
  }

}

window.Log = function(a,b,c){
  if(window.debug) console.log(a,b,c);
}
