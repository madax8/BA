# Komro Modemkarte

Dies ist eine auf Leaflet basierende Kartenanwendung zur Darstellung von Modemdaten innerhalb einer Karte.
Die Einzelheiten sind in der Bachelorarbeit genauer beschrieben.

![Komplettansicht über die Modems](https://github.com/madax8/BA/blob/master/static/Komplettansicht_12.12.2017.PNG)


# Startanleitung:
Lokal benötigte Bibliotheken/Tools: pip, flask, geopy, sql-alchemy, jquery

für Windows:
* Falls verwendet virtuelle Umgebung starten mit: venv\Scripts\activate
* Variablen setzen: 
    * set FLASK_APP=\_\_init\_\_.py
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
Die Marker werden als Cluster angelegt und dadurch, abhängig von der Zoomstufe, bei überlappung geclustert. Innerhalb der IconCreateFunction werden die Cluster entsprechend den beinhalteten Markern eingefärbt.
```javascript
var markers = L.markerClusterGroup({
    maxClusterRadius: 30,
    spiderfyOnMaxZoom: true,
    iconCreateFunction: function (cluster) {...}
});
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
Mit der create function lassen sich Geojsons erstellen, welchen dann im Client innerhalb der Karte dargestellt werden. 
```python
@app.route('/create/<name>')
def create_geojson(name):
    j = (db.session.query(modems, address)).filter(modems.mac == address.mac)
    print(j)

    save_json(name, convert_json(j))
    return "Erfolgreich!"
```
Die in aufgerufene Funktion convert_json(), dient dazu das Ergebniss des obigen Datenbankjoins in ein Jsonformat zu bringen.
```python
def convert_json(ar):
    table_as_dict = []
    for row in ar:
        row_address = "Deutschland Bayern " + row.address.city + " " \
                      + str(row.address.plz) + " " + row.address.street \
                      + " " + str(row.address.number)
        row_coords = lookup_coords(row_address)
        row_as_dict = {
            'type': "Feature",
            'properties': {
                'modelname': row.modems.modelname,
                'mac': row.modems.mac,
                'status': row.modems.status,
                'wert': row.modems.wert,
                'name': row.address.name,
                'street': row.address.street,
                'number': row.address.number,
                'plz': row.address.plz,
                'city': row.address.city
            },
            'geometry': {
                'type': 'Point',
                # frontend expect this to be swapped...
                'coordinates': [row_coords[1], row_coords[0]]
            }
        }
        table_as_dict.append(row_as_dict)
    geojson = {
        "type": "FeatureCollection",
        "features": table_as_dict
    }
    print(geojson)
    geojson = json.dumps(geojson, indent=4)
    return geojson
```
Lookup_coords dient dazu die Coordinaten der Adresse zu finden. Hierzu wird zunächst eine Lokale DB durchsucht ob diese Adresse bereits vorhanden ist.
```python
@app.route('/lookup/<addr>')
def lookup_coords(addr):
    m = mapAddress.query.filter_by(address=addr).first()
    if m:
        return [m.lat, m.lon]
    else:
        n = do_geocode(addr).raw
        for key, value in n.items():
            if key == 'lat':
                lat = value
            if key == 'lon':
                lon = value

        new_coords(addr, lat, lon)
        return [lat, lon]
```

Andernfalls wird ein Geokodierungsservice aufgerufen.
```python
    def do_geocode(addr):
        try:
            return geolocator.geocode(addr)
        except GeocoderTimedOut:
            time.sleep(1)
            return do_geocode(addr)
``` 

