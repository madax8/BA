

jN = window.location.pathname;
jN = jN.substring(15);
staticUrl = '/return_geojson' + jN;
$.getJSON(staticUrl, function(data){
    var json = JSON.stringify(data, null, 4);
    document.getElementById('json').innerHTML = json;
});



