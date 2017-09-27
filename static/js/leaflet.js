
var mod = {};
staticUrl = './return_geojson/all_4';
$.getJSON(staticUrl, function(data){
    mod = data;
    $.ajax({
        // wird leider vom Browser umgangen
        // async: false
    })
});

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


function onMarkerClick(e){
    var clickedPoint = e.target;
    var activeItem = document.getElementsByClassName('active');
    if (activeItem[0]) {
        activeItem[0].classList.remove('active');
    }
    // Find the index of the mod.features that corresponds to the clickedPoint that fired the event listener
    var selectedFeature = clickedPoint.feature.properties.display_name;
    for (var i = 0; i < mod.features.length; i++) {
        if (mod.features[i].properties.display_name === selectedFeature) {
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

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 19,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoibWFyZGF4IiwiYSI6ImNqMnB5eXpvMTAwNDMzM2xrdDF0eW02bTkifQ.VxANLxzX8ALvUIDG7y6FLQ'
}).addTo(map);

// define different colored marker icons
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
var blueIcon = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
var orangeIcon = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

var markers = L.markerClusterGroup({
    maxClusterRadius: 30,
    spiderfyOnMaxZoom: true
});

// Creating Markers and Popups from the Geojsonsource + add it to the Map
$(document).ajaxStop(function () {
    var geoJsonLayer = L.geoJson(mod, {
        pointToLayer: function (feature, latlng) {
            if(feature.properties.class == 'building'){
                return L.marker(latlng, {icon: blueIcon}).on('click', onMarkerClick);
            }else if(feature.properties.class == 'amenity'){
                return L.marker(latlng, {icon: orangeIcon}).on('click', onMarkerClick);
            }else if(feature.properties.class == 'office'){
                return L.marker(latlng, {icon: redIcon}).on('click', onMarkerClick);
            }else if(feature.properties.class == 'shop'){
                return L.marker(latlng, {icon: greenIcon}).on('click', onMarkerClick);
            }
            return L.marker(latlng).on('click', onMarkerClick);
        },
        onEachFeature: function (feature, layer){
            var popup = L.popup();
            var cName = 'blue';
            // Fargebung unterscheidet sich je nach inhalt des Properties
            if(feature.properties.class == 'building'){
                cName = 'blue';
            }else if(feature.properties.class == 'amenity'){
                cName = 'orange';
            }else if(feature.properties.class == 'office'){
                cName = 'red';
            }else if(feature.properties.class == 'shop'){
                cName = 'green';
            }
            popup.setContent(
                '<h3>' + feature.properties.class + '</h3>'
                + '<h4>' + feature.properties.type + '</h4>'
                + '<h4>' + feature.geometry.coordinates[0] + '</h4>'
                + '<h4>' + feature.geometry.coordinates[1] + '</h4>'
            );
            layer.bindPopup(popup,{className: cName});
        }
    });
    markers.addLayer(geoJsonLayer);
    map.addLayer(markers);
    map.fitBounds(markers.getBounds());
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
        link.innerHTML = prop.class;

        // Add an event listener for the links in the sidebar listing
        link.addEventListener('click', function(e) {
            // Update the currentFeature to the modem associated with the clicked link
            var clickedListing = data.features[this.dataPosition];
            // 1. Fly to the point associated with the clicked link
            map.setView(new L.LatLng(clickedListing.geometry.coordinates[1], clickedListing.geometry.coordinates[0]), 18);
            // 2. Close all other popups and display popup for clicked modem
            // createPopUp(clickedListing);
            // markers.openPopup();
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
        details.innerHTML = prop.display_name;
        details.innerHTML += '<br>' + currentFeature.geometry.coordinates[0] + ' | ' + currentFeature.geometry.coordinates[1];
    }
    // flyToAddress(data.features[0]);
}



