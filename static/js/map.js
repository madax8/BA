//persönlicher Token aus dem Mapbox-Konto
mapboxgl.accessToken = 'pk.eyJ1IjoibWFyZGF4IiwiYSI6ImNqMnB5eXpvMTAwNDMzM2xrdDF0eW02bTkifQ.VxANLxzX8ALvUIDG7y6FLQ';

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
    zoom: 16,
//    maxBounds: bounds // Sets bounds as max
});



//Geocoder erstellen
//var geocoder = new MapboxGeocoder({
//    accessToken: mapboxgl.accessToken
//});
//map.addControl(geocoder);

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
staticUrl = './static/test_1.geojson';
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

    // iteriert über das geojson und erweitert mit den entnomenen Daten die Modemliste
//    for(var i=0; i < Object.keys(mod.features).length; i++)
    mod.features.forEach(function(feature){
        var statusStr = "Status: " + String(feature.properties.class);
//        var statusStr = "Status: " + String(mod.features[i].properties.data);
        modems = [feature.properties.display_name, statusStr];
//        modems = [mod.features[i].properties.name, statusStr, coords];
        document.getElementById('feature-listing').appendChild(makeUL(modems));
    })

    // Listen for the `geocoder.input` event that is triggered when a user
    // makes a selection and add a symbol that matches the result.
//    geocoder.on('result', function(ev) {
//
//        erg = ev.result;
//        //map.getSource('single-point').setData(ev.result.geometry);
//        document.getElementById("koord").value = erg.center;
//        document.getElementById("ort").value = erg.place_name;
//
//        //debug hilfe
//        console.log(erg);
//
//
//        // add the point to the list
//        var placeStr = String(erg.place_name).split(',')
//        var centerStr = String(erg.center[0]) + " | " + String(erg.center[1])
//        modems = [placeStr[0], centerStr]
//        document.getElementById('feature-listing').appendChild(makeUL(modems));
//
//
//        //Punkt mit klickbaren popup
//        var popup = new mapboxgl.Popup({offset: 15})
//        .setText(placeStr[0]);
//
//        // create DOM element for the marker
//        var el = document.createElement('div');
//        el.id = 'marker';
//
//        // create the marker
//        new mapboxgl.Marker(el, {offset: [-15, -15]})
//            .setLngLat(erg.center)
//            .setPopup(popup) // sets a popup on this marker
//            .addTo(map);
//
//
//     });




    // creating a list for the points
    // Hier evtl. einen anderen Ansatz wählen; Es müsste eine direkte Zuordung zwischen Liste und Geopunkten erfolgen
    function makeUL(array) {
    // Create the list element:
    var list = document.createElement('ul');
    list.setAttribute('class', 'list-group');
    // Loop over the list:
    for(var i = 0; i < array.length; i++) {
            // Create the list item:
            var item = document.createElement('li');
            item.setAttribute('class', 'list-group-item');
            // Set its contents:
            item.appendChild(document.createTextNode(array[i]));
            // Add it to the list:
            list.appendChild(item);
    }


    // Finally, return the constructed list:
    return list;
    }
})


    // Create a popup, but don't add it to the map yet.
    var popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
    });


// mouseover -> display popup
map.on('mouseenter', 'modems', function(e){
    // get a nice looking cursor
    map.getCanvas().style.cursor = 'pointer';
    // set popup
    popup.setLngLat(e.features[0].geometry.coordinates).setHTML(e.features[0].properties.display_name).addTo(map);
})

// hide popup
map.on('mouseleave', 'modems', function(){
    map.getCanvas().style.cursor = '';
    popup.remove();
})




//Implementierung mit Geocoder
//map.on('load', function(){
//    map.addSource('single-point', {
//        "type": "geojson",
//        "data": {
//            "type": "FeatureCollection",
//            "features": []
//        }
//    });
//
//    map.addLayer({
//        "id": "point",
//        "source": "single-point",
//        "type": "circle",
//        "paint": {
//            'circle-radius': {
//                'base': 1.5,
//                'stops': [[8, 1.75], [16, 80]]
//            }
//        }
//
//    });
//
//    // Listen for the `geocoder.input` event that is triggered when a user
//    // makes a selection and add a symbol that matches the result.
//    geocoder.on('result', function(ev) {
//
//        erg = ev.result;
//        //map.getSource('single-point').setData(ev.result.geometry);
//        document.getElementById("koord").value = erg.center;
//        document.getElementById("ort").value = erg.place_name;
//        //debug hilfe
//        console.log(erg);
//
//
//        // add the point to the list
//        var placeStr = String(erg.place_name).split(',')
//        var centerStr = String(erg.center[0]) + " | " + String(erg.center[1])
//        modems = [placeStr[0], centerStr]
//        document.getElementById('feature-listing').appendChild(makeUL(modems));
//
//
//        //Punkt mit klickbaren popup
//        var popup = new mapboxgl.Popup({offset: 15})
//        .setText(placeStr[0]);
//
//        // create DOM element for the marker
//        var el = document.createElement('div');
//        el.id = 'marker';
//
//        // create the marker
//        new mapboxgl.Marker(el, {offset: [-15, -15]})
//            .setLngLat(erg.center)
//            .setPopup(popup) // sets a popup on this marker
//            .addTo(map);
//
//
//     });
//
//    // creating a list for the points
//    function makeUL(array) {
//    // Create the list element:
//    var list = document.createElement('ul');
//    // Loop over the
//    for(var i = 0; i < array.length; i++) {
//            // Create the list item:
//            var item = document.createElement('li');
//            // Set its contents:
//            item.appendChild(document.createTextNode(array[i]));
//            // Add it to the list:
//            list.appendChild(item);
//    }
//
//    // Finally, return the constructed list:
//    return list;
//    }
//
//
//
//
//})



