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


# Backend:

Das Backend ist in Python geschrieben und die Serverfunktionalität wird durch das Flask Framework unterstützt.

Hier finden sich als erste diverse Routingfunktionen.

    @app.route('/map/<name>')
    def show_map_dynamic(name):
        return render_template('leaflet.html', jsonName=name)

Desweiteren wird hier das Geocoding mithilfe einer Nominatim API durchgeführt.

    def do_geocode(addr):
        try:
            return geolocator.geocode(addr)
        except GeocoderTimedOut:
            time.sleep(1)
            return do_geocode(addr)
 
Außerdem ist es mithilfe folgender Funktion möglich ein Array in ein Geojsonobjekt umzuwandeln.

    def convert_json(ar):
        j = {"type": "FeatureCollection",
             "features": [
                {"type": "Feature",
                 "geometry": {"type": "Point",
                              "coordinates": [float(feat['lon']),
                                              float(feat['lat'])]},
                 "properties": {"data": {"status": "ok"},
                                "osm": {key: value
                                        for key, value in feat.items()
                                        if key not in ('lat', 'lon', 'boundingbox')}
                                }
                 }for feat in ar
             ]
        }

        j = json.dumps(j, indent=4)

        return j
