

jN = window.location.pathname;
jN = jN.substring(15);
staticUrl = '/return_geojson' + jN;
$.getJSON(staticUrl, function(data){
    container = document.getElementById('json');
    container.innerHTML = JSON.stringify(data, null, 4);
});



