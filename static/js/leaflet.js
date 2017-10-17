
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
    maxClusterRadius: 30,
    spiderfyOnMaxZoom: true,
    // erstellt das clusterhtml abhängig von den darunterliegenden Markern
    iconCreateFunction: function (cluster) {
        var childs = cluster.getAllChildMarkers();
        var foundred = 0, foundgrey = 0, foundyellow = 0;
        for(i=0; i < childs.length; i++) {
            if (childs[i].feature.properties.data.status === 'offline')
                foundgrey += 1;
            if(childs[i].feature.properties.data.status === 'error')
                foundred += 1;
            if(childs[i].feature.properties.data.status === 'warning')
                foundyellow += 1;
        }
        if((foundgrey >= 1 && childs.length < 30) || foundgrey >= 3)
            return L.divIcon({
                html: '<div class="marker-cluster">' + '<span>' + cluster.getChildCount() + '</span>' + '</div>',
                className: "marker-cluster grey",
                iconSize: new L.Point(40, 40)
            });
        else if(foundred >= 1)
            return L.divIcon({
                html: '<div class="marker-cluster">' + '<span>' + cluster.getChildCount() + '</span>' + '</div>',
                className: "marker-cluster red",
                iconSize: new L.Point(40, 40)
            });
        else if(foundyellow >= (childs.length / 2))
            return L.divIcon({
                html: '<div class="marker-cluster">' + '<span>' + cluster.getChildCount() + '</span>' + '</div>',
                className: "marker-cluster yellow",
                iconSize: new L.Point(40, 40)
            });
        else
            return L.divIcon({
                html: '<div class="marker-cluster">' + '<span>' + cluster.getChildCount() + '</span>' + '</div>',
                className: "marker-cluster green",
                iconSize: new L.Point(40, 40)
            });
    }
});

// Erstelle Marker und Popups aus der Geojsonsource und fügt sie der Karte hinzu
$(document).ajaxStop(function (){
    i = 0;
    var geoJsonLayer = L.geoJson(mod, {
        pointToLayer: function (feature, latlng) {
            //Frontend Datenmanipulation für Demonstrationszwecke
            i++;
            if( i % 2 === 0)
                feature.properties.data.status = 'ok';
            else if ( i % 5 === 0)
                feature.properties.data.status = 'warning';
            else if ( i % 7 === 0)
                feature.properties.data.status = 'error';
            else if (i % 13 === 0)
                feature.properties.data.status = 'offline';
            if(feature.properties.data.status === 'offline'){
                return L.marker(latlng, {icon: greyIcon}).on('click', onMarkerClick);
            }else if(feature.properties.data.status === 'warning'){
                return L.marker(latlng, {icon: yellowIcon}).on('click', onMarkerClick);
            }else if(feature.properties.data.status === 'error'){
                return L.marker(latlng, {icon: redIcon}).on('click', onMarkerClick);
            }else if(feature.properties.data.status === 'ok'){
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
    // changeClusterColor(markers);
});


// erstellen der Modemliste
function buildLocationList(data) {
    // Iterate through the list of stores
    for (i = 0; i < data.features.length; i++) {
        var currentFeature = data.features[i];
        // Shorten data.feature.properties to just `prop` so we're not
        // writing this long form over and over again.
        var prop = currentFeature.properties;
        // Select the listing container in the HTML and append a div
        // with the class 'item' for each modem
        var listings = document.getElementById('listings');
        var listing = listings.appendChild(document.createElement('div'));
        listing.className = 'item';
        listing.id = 'listing-' + i;

        // Create a new link with the class 'title' for each store
        // and fill it with the store address
        var link = listing.appendChild(document.createElement('a'));
        link.href = '#';
        link.className = 'title';
        link.dataPosition = i;
        link.innerHTML = prop.osm.class;

        // Add an event listener for the links in the sidebar listing
        link.addEventListener('click', function(e) {
            // Update the currentFeature to the modem associated with the clicked link
            var clickedListing = data.features[this.dataPosition];
            // 1. Fly to the point associated with the clicked link
            map.setView(new L.LatLng(clickedListing.geometry.coordinates[1], clickedListing.geometry.coordinates[0]), 18);
            var popup = createPopup(clickedListing);
            popup.setLatLng([clickedListing.geometry.coordinates[1], clickedListing.geometry.coordinates[0]]);
            popup.openOn(map);
            // 3. Highlight listing in sidebar (and remove highlight for all other listings)
            var activeItem = document.getElementsByClassName('active');
            if (activeItem[0]) {
                activeItem[0].classList.remove('active');
            }
            this.parentNode.classList.add('active');
        });
        // Create a new div with the class 'details' for each modem
        // and fill it with the properties you want
        var details = listing.appendChild(document.createElement('div'));
        details.innerHTML = prop.osm.display_name;
        details.innerHTML += '<br>' + currentFeature.geometry.coordinates[0] + ' | ' + currentFeature.geometry.coordinates[1];
    }
    // flyToAddress(data.features[0]);
}

// erstellen eines Popup mit entsprechender Einfärbung und Inhalt
function createPopup(feature){
    var cName = 'blue';
    // Fargebung unterscheidet sich je nach inhalt des Properties
    if(feature.properties.data.status === 'offline'){
        cName = 'grey';
    }else if(feature.properties.data.status === 'warning'){
        cName = 'yellow';
    }else if(feature.properties.data.status === 'error'){
        cName = 'red';
    }else if(feature.properties.data.status === 'ok'){
        cName = 'green';
    }
    var popup = L.popup({className: cName});
    var popup2 = L.popup({className: cName});
    popup.setContent(
        '<h3>' + feature.properties.osm.class + '</h3>'
        + '<h4>' + feature.properties.osm.type + '</h4>'
        + '<h4>' + feature.geometry.coordinates[0] + '</h4>'
        + '<h4>' + feature.geometry.coordinates[1] + '</h4>'
        + '<h4>'+ feature.properties.data.status + '</h4>'
    );
    return popup;
}

// versucht möglichst Effizient die übergebene Zeit zu verbrauchen.
function zeitSchinden(zeit){
    var gesZeit = zeit;
    var imgur = 15, lesen = 10, traeumen = 8, musik = 4, arbeiten = 30;
    var countA = 0, countL = 0, countI = 0, countT = 0, countM = 0;

    while(zeit >= musik){
        if(zeit >= arbeiten){
            zeit = zeit - arbeiten;
            countA += 1;
        }else if(zeit >= imgur){
            zeit = zeit - imgur;
            countI += 1;
        }else if(zeit >= lesen){
            zeit = zeit - lesen;
            countL++;
        }else if(zeit >= traeumen){
            zeit = zeit - traeumen;
            countT++;
        }else{
            zeit = zeit - musik;
            countM++;
        }
    }
    alert("Deine " + gesZeit + " Stunden wurden folgendermaßen aufgeteilt: "
        + countA + "x Arbeiten, " + countI + "x auf Imgur gammeln, "
        + countL + "x Fachartikel lesen, " + countT + "x sich Tagträumen hingeben, "
        + countM + "x Musik hören und noch " + zeit + " Minuten zum sandeln.")
}