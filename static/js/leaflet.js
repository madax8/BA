
var mod = {};
jN = window.location.pathname;
jN = jN.substring(4);
staticUrl = '/return_geojson' + jN;
$.getJSON(staticUrl, function(data){
    mod = data;
    $.ajax({
        // wird leider vom Browser umgangen und daher mit ajaxStop gelöst
        // async: false
    })
});
    // // regelmäßige aktualisierung der Daten
    // window.setInterval(function() {
    //     $.getJSON(staticUrl, function(data){
    //         mod = data;
    //     })
    //     map.getSource(mod);
    // }, 10000);


// This will let you use the .remove() function later on
if (!('remove' in Element.prototype)) {
    Element.prototype.remove = function() {
        if (this.parentNode) {
            this.parentNode.removeChild(this);
        }
    };
}

var map = L.map('map');
map.on('load', function(){
    $(document).ajaxStop(function(){
        buildLocationList(mod);
    });
});
map.setView([47.854954, 12.131016], 13);


// zusätzlicher Eventhandler für den Klick auf einen Marker
function onMarkerClick(e){
    var clickedPoint = e.target;
    var activeItem = document.getElementsByClassName('active');
    if (activeItem[0]) {
        activeItem[0].classList.remove('active');
    }
    // Find the index of the mod.features that corresponds to
    // the clickedPoint that fired the event listener
    var selectedFeature = clickedPoint.feature.properties.name;
    for (var i = 0; i < mod.features.length; i++) {
        if (mod.features[i].properties.name === selectedFeature) {
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

// hier wird der Basislayer(Basiskartendaten) der Karte hinzugefügt
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OSM</a>, <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoibWFyZGF4IiwiYSI6ImNqMnB5eXpvMTAwNDMzM2xrdDF0eW02bTkifQ.VxANLxzX8ALvUIDG7y6FLQ'
}).addTo(map);

// definiert verschiedenfarbige Icons die später als Marker verwendet werden
var greenIcon = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
var redIcon = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
var greyIcon = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
var yellowIcon = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// legt die Einstellungen für das Clusterverhalten fest
var markers = L.markerClusterGroup({
    maxClusterRadius: 40,
    spiderfyOnMaxZoom: true,
    // erstellt das clusterhtml abhaengig von den darunterliegenden Markern
    iconCreateFunction: function (cluster) {
        var childs = cluster.getAllChildMarkers();
        var foundred = 0, foundgrey = 0, foundyellow = 0;
        for(i=0; i < childs.length; i++) {
            if (childs[i].feature.properties.status === 'offline')
                foundgrey += 1;
            if(childs[i].feature.properties.status === 'error')
                foundred += 1;
            if(childs[i].feature.properties.status === 'warning')
                foundyellow += 1;
        }// hier muss entschieden werden, welche typen priorisiert werden.
        if((foundgrey >= 1 && childs.length < 30 && foundred < 1)
                || (foundgrey >= 3 && foundred < 2))
            return L.divIcon({
                html: '<div class="marker-cluster">' + '<span>' + cluster.getChildCount()
                    + '</span>' + '</div>',
                className: "marker-cluster grey",
                iconSize: new L.Point(40, 40)
            });
        else if(foundred >= 1)
            return L.divIcon({
                html: '<div class="marker-cluster">' + '<span>' + cluster.getChildCount()
                    + '</span>' + '</div>',
                className: "marker-cluster red",
                iconSize: new L.Point(40, 40)
            });
        else if(foundyellow >= (childs.length / 2))
            return L.divIcon({
                html: '<div class="marker-cluster">' + '<span>' + cluster.getChildCount()
                    + '</span>' + '</div>',
                className: "marker-cluster yellow",
                iconSize: new L.Point(40, 40)
            });
        else
            return L.divIcon({
                html: '<div class="marker-cluster">' + '<span>' + cluster.getChildCount()
                    + '</span>' + '</div>',
                className: "marker-cluster green",
                iconSize: new L.Point(40, 40)
            });
    }
});


// Erstelle Marker und Popups aus der Geojsonsource und fuegt sie der Karte hinzu
$(document).ajaxStop(function (){
    var geoJsonLayer = L.geoJson(mod, {
        pointToLayer: function (feature, latlng) {
            //Status bestimmt die Iconfarbe
            if(feature.properties.status === 'offline'){
                return L.marker(latlng, {icon: greyIcon}).on('click', onMarkerClick);
            }else if(feature.properties.status === 'warning'){
                return L.marker(latlng, {icon: yellowIcon}).on('click', onMarkerClick);
            }else if(feature.properties.status === 'error'){
                return L.marker(latlng, {icon: redIcon}).on('click', onMarkerClick);
            }else if(feature.properties.status === 'ok'){
                return L.marker(latlng, {icon: greenIcon}).on('click', onMarkerClick);
            }
            return L.marker(latlng).on('click', onMarkerClick);
        },
        onEachFeature: function (feature, layer){
            var popup = createPopup(feature);
            layer.bindPopup(popup);
        }
    });
    markers.addLayer(geoJsonLayer);
    map.addLayer(markers);
    map.fitBounds(markers.getBounds());
});


// erstellen der Modemliste
function buildLocationList(data) {
    // Iteriert durch die Modemliste
    for (i = 0; i < data.features.length; i++) {
        var currentFeature = data.features[i];
        // vereinfachung
        var prop = currentFeature.properties;
        // Waehle den Container in HTML aus und haenge ein div von der Klasse 'item' an
        var listings = document.getElementById('listings');
        var listing = listings.appendChild(document.createElement('div'));
        listing.className = 'item';
        listing.id = 'listing-' + i;

        // erstelle einen Link von der Klasse 'title' für jedes Modem
        // und befuelle in mit dem Bezeichner
        var link = listing.appendChild(document.createElement('a'));
        link.href = '#';
        link.className = 'title';
        link.dataPosition = i;
        link.innerHTML = prop.name;

        // link funktionalitaet
        link.addEventListener('click', function(e) {
            // Aktualisiere das currentFeature
            var clickedListing = data.features[this.dataPosition];
            // 1. Zentriere die Karte auf das entsprechende Modem
            map.setView(new L.LatLng(clickedListing.geometry.coordinates[1],
                                     clickedListing.geometry.coordinates[0]), 18);
            // 2. Erstelle ein Popup an der Modemposition
            var popup = createPopup(clickedListing);
            popup.setLatLng([clickedListing.geometry.coordinates[1],
                             clickedListing.geometry.coordinates[0]]);
            popup.openOn(map);
            // 3. Hebe das Listenelement in der Sidebar hervor
            var activeItem = document.getElementsByClassName('active');
            if (activeItem[0]) {
                activeItem[0].classList.remove('active');
            }
            this.parentNode.classList.add('active');
        });
        // Erstelle ein neues div von der Klasse 'details' für jedes Modem
        // und befülle es mit den wichtigen Properties
        var details = listing.appendChild(document.createElement('div'));
        details.innerHTML = prop.street + " " + prop.number;
        details.innerHTML += '<br>' + prop.plz + " " + prop.city
                            + '<br>' + prop.modelname;
    }
}

// erstellen eines Popup mit entsprechender Einfärbung und Inhalt
function createPopup(feature){
    var cName = 'blue';
    // Fargebung unterscheidet sich je nach Inhalt des Properties
    if(feature.properties.status === 'offline'){
        cName = 'grey';
    }else if(feature.properties.status === 'warning'){
        cName = 'yellow';
    }else if(feature.properties.status === 'error'){
        cName = 'red';
    }else if(feature.properties.status === 'ok'){
        cName = 'green';
    }
    var popup = L.popup({className: cName});
    popup.setContent(
        '<h3>' + feature.properties.name + '</h3>'
        + '<h4>Mac: ' + feature.properties.mac + '</h4>'
        + '<h4>Typ: ' + feature.properties.modelname + '</h4>'
        + '<h4>Wert: ' + feature.properties.wert + '</h4>'
        + '<h4>Status: ' + feature.properties.status + '</h4>'
    );
    return popup;
}

