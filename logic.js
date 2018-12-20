// Define map layers
var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", 
{
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.streets",
  accessToken: API_KEY
})

var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", 
{
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.streets-satellite",
  accessToken: API_KEY
});

// Initialize all of the LayerGroups we'll be using
var layers = {
    Street: new L.LayerGroup(),
    Dark: new L.LayerGroup(),
    Quakes: new L.LayerGroup(),
    Faults: new L.LayerGroup()
  };

// Create the map with our layers
var myMap = L.map("map", {
    center: [6.4238, -10.5897],
    zoom: 2.1,
    minZoom: 2.1,
    layers: [
        streetmap,
        layers.Quakes,
        layers.Faults
        ]
    });

// Add base tile layer to the map
var baseMaps = {
  "Street Map": streetmap,
  "Satellite Map": darkmap
};

//Create an overlays object to add to the layer control
var overlays = {
  "Earthquakes": layers.Quakes,
  "Faults": layers.Faults
};

var legend = L.control({position: 'bottomright'});
legend.onAdd = function(map) 
{
var div = L.DomUtil.create('div', 'info legend'),
    mags = [0, 1, 2, 3, 4, 5],
    labels = []

    div.innerHTML += '<b>Earthquakes/</b><br>'
    div.innerHTML += '<b>Magnitude</b><br>' 
    div.innerHTML += '<b>This Past Week</b><br><br>' 

    // loop through our density intervals and generate a label with a colored 
    //square for each interval
    for (var i = 0; i < mags.length; i++) {
    div.innerHTML +=
        '<i style="background:' + getColor(mags[i] + 1) + '"></i> ' +
        mags[i] + (mags[i + 1] ? '&ndash;' + mags[i + 1] + '<br>' : '+');
    }
    return div;
};
legend.addTo(myMap);
  
// Create a control for our layers, add our overlay layers to it
L.control.layers(baseMaps, overlays).addTo(myMap);


// Create API endpoint
var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// fault lines data link
var platesLink = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json"


// Perform a GET request to the query URL for Earthquake data
d3.json(url, function (data) 
{
  var quakes = data.features
  //send each feature into L.geoJSON function
    var earthquakes = L.geoJSON(quakes, 
  {
    pointToLayer: function (feature, latlng) 
    {
      return new L.CircleMarker(latlng,
        {
          radius: (feature.properties.mag * 4),  
          fillOpacity: 1, 
          color: 'black', 
          fillColor: getColor(feature.properties.mag), 
          weight: 1
        })
    },

    //Give each feature a popup describing the place, time, and magnitude of the earthquake
    onEachFeature: function(feature, layer) 
    {
      layer.bindPopup(
        "<h3>" + feature.properties.place +
        "</h3><hr><p>" + new Date(feature.properties.time) + "</p>" + 
        "</h3><hr><p>" + "Magnitude:  " + (feature.properties.mag) + "</p>"
      )
    }

  }).addTo(layers.Quakes);

// // get Fault data and add to Fault layer
//   d3.json(platesLink, function(data)
//   {
//     var faultFeatures = data.features
//     var styling = 
//     {
//         "fillOpacity": 0
//     }

//     var faults = L.geoJSON(faultFeatures, 
//       {
//         style: function(feature)
//         {
//             return styling
//         }
//       }).addTo(myMap)
//     //   createMap(earthquakes, faults)  
//   }).addTo(layers.Faults)
});

// define function for get color
function getColor(d) 
{
  return d <= 1 ? 'green' :
        d > 1 && d <= 2  ? 'lightgreen' :
        d > 2 && d <= 3  ? 'lightyellow' :
        d > 3 && d <= 4  ? 'orange' :
        d > 4 && d <= 5   ? 'pink' :
                    'red';
} 