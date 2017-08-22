//persönlicher Token aus dem Mapbox-Konto
mapboxgl.accessToken = 'pk.eyJ1IjoibWFyZGF4IiwiYSI6ImNqMnB5eXpvMTAwNDMzM2xrdDF0eW02bTkifQ.VxANLxzX8ALvUIDG7y6FLQ';

// This will let you use the .remove() function later on
if (!('remove' in Element.prototype)) {
  Element.prototype.remove = function() {
    if (this.parentNode) {
      this.parentNode.removeChild(this);
    }
  };
}

//Maximalgröße der Karte
var bounds = [
    [11.764160, 47.689197], //südwest
    [12.405487, 47.991530]  //nordost
    ];

// Karte initialisieren
var map = new mapboxgl.Map({
    container: 'map',
    //streets, dark, light, satellite-streets
    style: 'mapbox://styles/mapbox/streets-v10',
    center: [12.131016, 47.854954],
    zoom: 15,
//    maxBounds: bounds // Sets bounds as max
});


// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());

// fullscreen
map.addControl(new mapboxgl.FullscreenControl());

//jedes feature enthält die Koordinaten des Punktes im geometry Teil
//im Property Teil kann man selbst die Daten eines Modems hinzufügen
var mod = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "name": "Am Innreit 2",
        "data": "ok"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [
          12.13210344314575,
          47.85496963855513
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Innstraße 36",
        "data": "notok"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [
          12.132704257965088,
          47.85456648450546
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Innstraße 27",
        "data": "maybe"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [
          12.132446765899658,
          47.854915644890994
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "modem4",
        "data": "ok"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [
          12.132736444473267,
          47.85494444151888
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "modem5",
        "data": "ok"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [
          12.13239312171936,
          47.854580882918334
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "modem6",
        "data": "ok"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [
          12.132226824760435,
          47.85540518538998
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "modem7",
        "data": "ok"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [
          12.130944728851318,
          47.85496603897929
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "modem8",
        "data": "ok"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [
          12.132961750030516,
          47.855379988565346
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "modem9",
        "data": "ok"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [
          12.131373882293701,
          47.85517481396618
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "modem10",
        "data": "ok"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [
          12.130815982818604,
          47.854670872908336
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "modem11",
        "data": "ok"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [
          12.132972478866577,
          47.853882555287754
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "modem12",
        "data": "ok"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [
          12.13063359260559,
          47.855883922731486
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "modem13",
        "data": "ok"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [
          12.130064964294434,
          47.855066827008955
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "modem14",
        "data": "ok"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [
          12.129389047622679,
          47.85566795154572
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "modem15",
        "data": "ok"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [
          12.130719423294067,
          47.8542533180359
        ]
      }
    }
  ]
};


// müsste man eigentlich beim Seitenaufruf mitgegeben bekommen
//staticUrl = './static/test_1.geojson';
jN = window.location.pathname;
jN = jN.substring(4);
staticUrl = '/return_geojson' + jN;
$.getJSON(staticUrl, function(data){
    mod = data;
})

// layer wechseln ist etwas redundant
// allerdings bietet mapbox keine wirklichen alternativen
var layerList = document.getElementById('switch');
var inputs = layerList.getElementsByTagName('input');
function switchLayer(layer) {
    var layerId = layer.target.id;
    map.setStyle('mapbox://styles/mapbox/' + layerId + '-v10');
     map.on('style.load', function() {
         map.addSource('single-point', {
        "type": "geojson",
        "data": mod
    });
         map.addLayer({
        "id": "modems",
        "type": "circle",
        "source": "single-point",
        "paint": {
        'circle-radius': {
                'base': 1.75,
                'stops': [[12, 2], [22, 180]]
            },
            "circle-color": {
                "property": "class",
                "type": "categorical",
                "stops": [
                    ["building", "#223b53"],      //blau (Wohn)Gebäude
                    ["amenity", "#fbb03b"],   //gelb Dienstleitungen
                    ["office", "#B42222"],    //rot Büros
                    ["shop","#349b4b"]         //grün einkaufen
                    ]
            },
            "circle-stroke-width": 3,        //stärke der umrandung
            "circle-stroke-color": {
                "property": "type",
                "type": "categorical",
                "stops": [
                    ["yes", "#349b4b"],         //standardtyp bzw. kein spezieller typ
                    ["restaurant", "#B42222"]
                ]
            }
        },
    });
    });
}
for (var i = 0; i < inputs.length; i++) {
    inputs[i].onclick = switchLayer;
}



// Implementierung mit Geojson
map.on('load', function(){

//    window.setInterval(function() {
//        map.getSource(mod).setData(staticUrl);
//    }, 2000);

    map.addSource('point', {
        "type": "geojson",
        "data": mod
    });

    map.addLayer({
        "id": "modems",
        "type": "circle",
        "source": "point",
        "paint": {
        'circle-radius': {
                'base': 1.75,
                'stops': [[12, 2], [22, 180]]
            },
            "circle-color": {
                "property": "class",
                "type": "categorical",
                "stops": [
                    ["building", "#223b53"],      //blau (Wohn)Gebäude
                    ["amenity", "#fbb03b"],   //gelb Dienstleitungen
                    ["office", "#B42222"],    //rot Büros
                    ["shop","#349b4b"]         //grün einkaufen
                    ]
            },
            "circle-stroke-width": 3,        //stärke der umrandung
            "circle-stroke-color": {
                "property": "type",
                "type": "categorical",
                "stops": [
                    ["yes", "#349b4b"],         //standardtyp bzw. kein spezieller typ
                    ["restaurant", "#B42222"]
                ]
            }
        },
    });

      buildLocationList(mod);

      // Add an event listener for when a user clicks on the map
    map.on('click', function(e) {
      // Query all the rendered points in the view
      var features = map.queryRenderedFeatures(e.point, { layers: ['modems'] });
      if (features.length) {
        var clickedPoint = features[0];
        // 1. Fly to the point
        flyToStore(clickedPoint);
        // 2. Close all other popups and display popup for clicked store
        createPopUp(clickedPoint);
        // 3. Highlight listing in sidebar (and remove highlight for all other listings)
        var activeItem = document.getElementsByClassName('active');
        if (activeItem[0]) {
          activeItem[0].classList.remove('active');
        }
        // Find the index of the store.features that corresponds to the clickedPoint that fired the event listener
        var selectedFeature = clickedPoint.properties.address;

        for (var i = 0; i < stores.features.length; i++) {
          if (stores.features[i].properties.address === selectedFeature) {
            selectedFeatureIndex = i;
          }
        }
        // Select the correct list item using the found index and add the active class
        var listing = document.getElementById('listing-' + selectedFeatureIndex);
        listing.classList.add('active');
      }
    });

    // iteriert über das geojson und erweitert mit den entnomenen Daten die Modemliste
//    for(var i=0; i < Object.keys(mod.features).length; i++)
//    mod.features.forEach(function(feature){
//        var statusStr = "Status: " + String(feature.properties.class);
////        var statusStr = "Status: " + String(mod.features[i].properties.data);
//        modems = [feature.properties.display_name, statusStr, feature.geometry.coordinates];
//        map.flyTo({
//            center: feature.geometry.coordinates
//        })
////        modems = [mod.features[i].properties.name, statusStr, coords];
//        document.getElementById('feature-listing').appendChild(makeUL(modems));
//
//
//    })


    // creating a list for the points
    // Hier evtl. einen anderen Ansatz wählen; Es müsste eine direkte Zuordung zwischen Liste und Geopunkten erfolgen
//    function makeUL(array) {
//    // Create the list element:
//    var list = document.createElement('ul');
//    list.setAttribute('class', 'list-group');
//    // Loop over the list:
//    for(var i = 0; i < array.length; i++) {
//            // Create the list item:
//            var item = document.createElement('li');
//            item.setAttribute('class', 'list-group-item');
//            // Set its contents:
//            item.appendChild(document.createTextNode(array[i]));
//
//            // Add it to the list:
//            list.appendChild(item);
//    }
//
//
//    // Finally, return the constructed list:
//    return list;
//    }
//        renderListings(mod);
})


function buildLocationList(data) {
  // Iterate through the list of stores
  for (i = 0; i < data.features.length; i++) {
    var currentFeature = data.features[i];
    // Shorten data.feature.properties to just `prop` so we're not
    // writing this long form over and over again.
    var prop = currentFeature.properties;
    // Select the listing container in the HTML and append a div
    // with the class 'item' for each store
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
    link.innerHTML = prop.display_name;


    // Add an event listener for the links in the sidebar listing
    link.addEventListener('click', function(e) {
      // Update the currentFeature to the store associated with the clicked link
      var clickedListing = data.features[this.dataPosition];
      // 1. Fly to the point associated with the clicked link
      flyToStore(clickedListing);
      // 2. Close all other popups and display popup for clicked store
      createPopUp(clickedListing);
      // 3. Highlight listing in sidebar (and remove highlight for all other listings)
      var activeItem = document.getElementsByClassName('active');
      if (activeItem[0]) {
        activeItem[0].classList.remove('active');
      }
      this.parentNode.classList.add('active');
    });
    // Create a new div with the class 'details' for each store
    // and fill it with the city and phone number
    var details = listing.appendChild(document.createElement('div'));
    details.innerHTML = prop.class;
//    if (prop.phone) {
//      details.innerHTML += ' &middot; ' + prop.phoneFormatted;
//    }
  }
}


function flyToStore(currentFeature) {
  map.flyTo({
    center: currentFeature.geometry.coordinates,
    zoom: 15
  });
}

function createPopUp(currentFeature) {
  var popUps = document.getElementsByClassName('mapboxgl-popup');
  // Check if there is already a popup on the map and if so, remove it
  if (popUps[0]) popUps[0].remove();

  var popup = new mapboxgl.Popup({ closeOnClick: false })
    .setLngLat(currentFeature.geometry.coordinates)
    .setHTML('<h3>' + currentFeature.properties.class + '</h3>' +
      '<h4>' + currentFeature.properties.display_name + '</h4>')
    .addTo(map);
}




