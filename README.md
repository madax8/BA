# Komro Modemkarte

Dies ist eine auf Leaflet basierende Kartenanwendung zur Darstellung von Modemdaten innerhalb einer Karte.
Die Einzelheiten sind in der Bachelorarbeit genauer beschrieben.

![Komplettansicht über die Modems](https://github.com/madax8/BA/blob/master/static/Komplettansicht.PNG)


# Startanleitung:
Lokal benötigte Bibliotheken/Tools: pip, flask, geopy, sql-alchemy, jquery

für Windows:
* Falls verwendet virtuelle Umgebung starten mit: venv\Scripts\activate
* Variablen setzen: 
    * set FLASK_APP=__init__.py
    * set FLASK_DEBUG=1             (Optional für Debugmodus)
* Server starten mit: 
    * flask run
    * alternativ: python -m flask run

für Linux muss beim setzen der variablen export statt set verwendet werden.

# Client:

Der Client baut sich wie in einer Webanwendung üblich auf HTML, CSS und JS auf. Als zusätzliche Hilfsmittel werden nebem dem nativen JavaScript noch JQuery und Leaflet.js(einem Kartenframework) verwendet.

 
Erstellt eine Variable mod und lädt sich anschließend das Geojson von Server in die Variable.

```javascript
var mod = {};
jN = window.location.pathname;
jN = jN.substring(4);
staticUrl = '/return_geojson' + jN;
$.getJSON(staticUrl, function(data){
    mod = data;
});
```
 
Mithilfe dieser Funktionen wird die Basiskarte initialisiert. Die Kartenbasisdaten kommen von einer Mapbox API. 
```javascript
    var map = L.map('map');
    map.setView([47.854954, 12.131016], 13);
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}',{
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OSM</a>, <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1IjoibWFyZGF4IiwiYSI6ImNqMnB5eXpvMTAwNDMzM2xrdDF0eW02bTkifQ.VxANLxzX8ALvUIDG7y6FLQ'
    }).addTo(map);
 ```
Folgendes wird zum erstellen der Modemliste innerhalb der Sidebar verwendet.

```javascript
    function buildLocationList(data) {...}
```
 
CreatePopup dient er Erstellung der Popups und deren Formatierung.
```javascript
    function createPopup(feature){...}
```   
Zur Erstellung verschiedenfarbiger Marker wurde folgende API verwendet: https://github.com/pointhi/leaflet-color-markers
Mithilfe von
```javascript
    L.marker(latlng, {icon: greenIcon}).on('click', onMarkerClick); 
```    
wird ein Marker erstellt und dann zu einem Layer hinzugefügt. Dieser Layer wird dann anschließend der Map angehängt.
```javascript
    map.addLayer(markers);
```
Ein Zusätzlicher Eventhandler für den Click auf einen Marker, der weitere Funktionalität neben dem öffnen des Popups hinzufügt. Zum geklickten Marker auf der Karte wird das entsprechende Listenelement aktiv gesetzt, was eine optische hervorhebung zu folge hat, und die Liste so gescrollt, das dieses Element zu sehen ist.
```javascript
    function onMarkerClick(e){
        var clickedPoint = e.target;
        var activeItem = document.getElementsByClassName('active');
        if (activeItem[0]) {
            activeItem[0].classList.remove('active');
        }
        // Find the index of the mod.features that corresponds to the clickedPoint that fired the event listener
        var selectedFeature = clickedPoint.feature.properties.osm.display_name;
        for (var i = 0; i < mod.features.length; i++) {
            if (mod.features[i].properties.osm.display_name === selectedFeature) {
                selectedFeatureIndex = i;
            }
        }
        // Select the correct list item using the found index and add the active class
        var listing = document.getElementById('listing-' + selectedFeatureIndex);
        listing.classList.add('active');

        // Scroll to the Position on the List
        var topPos = listing.offsetTop - 230;
        document.getElementById('listings').scrollTop = topPos;
    }
```

# Server:

Das Backend ist in Python geschrieben und die Serverfunktionalität wird durch das Flask Framework unterstützt. Für eine einfachere Verwendung von Geokoding-APIs wird hier auf die Erweiterung geopy gesetzt. Desweiteren wurde SQLAlchemy zur besseren verwendung von Postgres Datenbanken verwendet.

Hier finden sich als erste diverse Routingfunktionen.
```python
    @app.route('/map/<name>')
    def show_map_dynamic(name):
        return render_template('leaflet.html', jsonName=name)
```
Desweiteren wird hier das Geocoding mithilfe einer Nominatim API durchgeführt.
```python
    def do_geocode(addr):
        try:
            return geolocator.geocode(addr)
        except GeocoderTimedOut:
            time.sleep(1)
            return do_geocode(addr)
``` 
Außerdem ist es mithilfe folgender Funktion möglich ein Array in ein Geojsonobjekt umzuwandeln.
```python
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
```
