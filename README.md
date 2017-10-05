# Komro Modemkarte

Dies ist eine auf Leaflet basierende Kartenanwendung zur Darstellung von Modemdaten innerhalb einer Karte.
Die Einzelheiten sind im Wiki genauer beschrieben.

 

# Frontend:

 
Erstellt eine Variable mod und lädt sich anschließend das Geojson von Server in die Variable.

    var mod = {};
    jN = window.location.pathname;
    jN = jN.substring(4);
    staticUrl = '/return_geojson' + jN;
    $.getJSON(staticUrl, function(data){
        mod = data;
    });

 
Mithilfe dieser Funktionen wird die Basiskarte initialisiert.

    var map = L.map('map');
    map.setView([47.854954, 12.131016], 13);
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}',{
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OSM</a>, <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1IjoibWFyZGF4IiwiYSI6ImNqMnB5eXpvMTAwNDMzM2xrdDF0eW02bTkifQ.VxANLxzX8ALvUIDG7y6FLQ'
    }).addTo(map);
 
Folgendes wird zum erstellen der Modemliste innerhalb der Sidebar verwendet.

    function buildLocationList(data) {...}

 
CreatePopup dient er Erstellung der Popups und deren Formatierung.

    function createPopup(feature){...}
    
Zur Erstellung verschiedenfarbiger Marker wurde folgende API verwendet:
https://github.com/pointhi/leaflet-color-markers


