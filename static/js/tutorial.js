// This will let you use the .remove() function later on
if (!('remove' in Element.prototype)) {
  Element.prototype.remove = function() {
    if (this.parentNode) {
      this.parentNode.removeChild(this);
    }
  };
}

mapboxgl.accessToken = 'pk.eyJ1IjoibWFyZGF4IiwiYSI6ImNqMXJtbXdzcDAwMGQyeHA5dHJ2dzk0cXYifQ.-u9docIARufpe60AmWEFTA';
// This adds the map to your page
var map = new mapboxgl.Map({
  // container id specified in the HTML
  container: 'map',
  // style URL
  style: 'mapbox://styles/mapbox/light-v9',
  // initial position in [lon, lat] format
  center: [12.131016, 47.854954],
  // initial zoom
  zoom: 14
});

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
staticUrl = './static/test_1.geojson'
$.getJSON(staticUrl, function(data){
    mod = data;
})



map.on('load', function(e) {
  // Add the data to your map as a layer
  map.addLayer({
    id: 'locations',
    type: 'symbol',
    // Add a GeoJSON source containing place coordinates and information.
    source: {
      type: 'geojson',
      data: mod
    },
    layout: {
      'icon-image': 'restaurant-15',
      'icon-allow-overlap': true,
    }
  });

  buildLocationList(mod);

      // Add an event listener for when a user clicks on the map
    map.on('click', function(e) {
      // Query all the rendered points in the view
      var features = map.queryRenderedFeatures(e.point, { layers: ['locations'] });
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
});

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


