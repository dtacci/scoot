$(document).ready(function() {
    var zoomdiv = {};
    var startlat = {};
    var startlong = {};

    jQuery(function ($) {
    var windowsize = $(window).width();
            if (windowsize <600)
            {
                $("#form-wrap").remove().insertAfter($("#map_canvas"));
            } else {
                $("#form-wrap").remove().insertBefore($("#map_canvas"));
            }
       });
   
//get initial zoom, lat, long from custom fields in Wordpress:  
var initialzoom = $('#zoom').html();
if (initialzoom ==='') {
    zoomdiv = 13;
} else {
    zoomdiv = $('#zoom').html();
}
var initiallat = $('#startlat').html();
if (initiallat ==='') {
    startlat = 37.774732;
}   else {
startlat = $('#startlat').html();
}
var initiallong = $('#startlong').html();
if (initiallong ==='') {
    startlong = -122.433357;
} else {
    startlong = $('#startlong').html();
}

//JUST NORTH OF DUBOCE
var DEFAULT_POSITION_LAT = startlat;
var DEFAULT_POSITION_LNG = startlong;

//map zoom levels
var MAP_MAX_ZOOM = 17;
var MAP_MIN_ZOOM = 12;
var MAP_INITIAL_ZOOM = zoomdiv;

//MAPBOX ROUTES
var routeLayerGroup = L.featureGroup();

//ROUTE CONSTANTS
var ROUTE_WALKING_SPEED = 3;
var ROUTE_SCOOTING_SPEED = 15;
var ROUTE_TAXI_SPEED = 18;
var TAXI_RATE_FIRST = 3.50; //dollars for first 1/5 mile
var TAXI_RATE_FIFTHS = 0.55; //dollars for each subsequent 1/5 mile

//locations
var latestLocationsData;
var locationMarkers = [];
var latestScooterData;
var scooterMarkers = [];

var scootGarages = null;
var startGarage = null;
var endGarage = null;
var closestScootID = null;
var isGarage = null;

//DIRECTIONS
var allDirections = [];

//
// map
//

function initializeIconsForMap() {
    scootGarageIcon = L.icon({
        iconUrl: '//scoot.co/map/assets/scoot_garage.png',
        iconSize: [41, 42], // size of the icon
        iconAnchor: [20, 42], // point of the icon which will correspond to marker's location
        popupAnchor: [0, -42] // point from which the popup should open relative to the iconAnchor
    });
    scootGarageSelectedIcon = L.icon({
        iconUrl: '//scoot.co/map/assets/scoot_garage_selected.png',
        iconSize: [41, 42], // size of the icon
        iconAnchor: [20, 42], // point of the icon which will correspond to marker's location
        popupAnchor: [0, -42] // point from which the popup should open relative to the iconAnchor
    });
    scootStopIcon = L.icon({
        iconUrl: '//scoot.co/map/assets/scoot_stop.png',
        iconSize: [40, 68], // size of the icon
        iconAnchor: [20, 68], // point of the icon which will correspond to marker's location
        popupAnchor: [0, -68] // point from which the popup should open relative to the iconAnchor
    });
    scootStopSelectedIcon = L.icon({
        iconUrl: '//scoot.co/map/assets/scoot_stop_selected.png',
        iconSize: [40, 68], // size of the icon
        iconAnchor: [20, 68], // point of the icon which will correspond to marker's location
        popupAnchor: [0, -68] // point from which the popup should open relative to the iconAnchor
    });
    startMarkerIcon = L.icon({
        iconUrl: '//scoot.co/map/assets/marker_start.png',
        iconSize: [28, 44], // size of the icon
        iconAnchor: [13, 40], // point of the icon which will correspond to marker's location
        shadowUrl: '//scoot.co/map/assets/marker_shadow.png',
        shadowSize: [41, 41],
        shadowAnchor: [13, 40]
    });
    endMarkerIcon = L.icon({
        iconUrl: '//scoot.co/map/assets/marker_end.png',
        iconSize: [28, 44], // size of the icon
        iconAnchor: [13, 40], // point of the icon which will correspond to marker's location
        shadowUrl: '//scoot.co/map/assets/marker_shadow.png',
        shadowSize: [41, 41],
        shadowAnchor: [13, 40]
    });
    scootIcon = L.icon({
        iconUrl: '//scoot.co/map/assets/scootMarker_white.png',
        iconSize: [24, 24], // size of the icon
        iconAnchor: [13, 40], // point of the icon which will correspond to marker's location
        popupAnchor: [0, -42], // point from which the popup should open relative to the iconAnchor        
        shadowUrl: '',//'//scoot.co/map/assets/marker_shadow.png',
        shadowSize: [41, 41],
        shadowAnchor: [13, 40]
    });  
    scootIconSelected = L.icon({
        iconUrl: '//scoot.co/map/assets/scootMarker_white_selected.png',
        iconSize: [24, 24], // size of the icon
        iconAnchor: [13, 40], // point of the icon which will correspond to marker's location
        popupAnchor: [0, -42], // point from which the popup should open relative to the iconAnchor        
        shadowUrl: '',//'//scoot.co/map/assets/marker_shadow.png',
        shadowSize: [41, 41],
        shadowAnchor: [13, 40]
    });       
    scootClassicIcon = L.icon({
        iconUrl: '//scoot.co/map/assets/scootMarker_classic_white.png',
        iconSize: [24, 24], // size of the icon
        iconAnchor: [13, 40], // point of the icon which will correspond to marker's location
        popupAnchor: [0, -42], // point from which the popup should open relative to the iconAnchor        
        shadowUrl: '',//'//scoot.co/map/assets/marker_shadow.png',
        shadowSize: [41, 41],
        shadowAnchor: [13, 40]
    });
    scootClassicIconSelected = L.icon({
        iconUrl: '//scoot.co/map/assets/scootMarker_classic_white_selected.png',
        iconSize: [24, 24], // size of the icon
        iconAnchor: [13, 40], // point of the icon which will correspond to marker's location
        popupAnchor: [0, -42], // point from which the popup should open relative to the iconAnchor        
        shadowUrl: '',//'//scoot.co/map/assets/marker_shadow.png',
        shadowSize: [41, 41],
        shadowAnchor: [13, 40]
    });    
    scootCargoIcon = L.icon({
        iconUrl: '//scoot.co/map/assets/scootMarker_cargo_white.png',
        iconSize: [24, 24], // size of the icon
        iconAnchor: [13, 40], // point of the icon which will correspond to marker's location
        popupAnchor: [0, -42], // point from which the popup should open relative to the iconAnchor        
        shadowUrl: '',//'//scoot.co/map/assets/marker_shadow.png',
        shadowSize: [41, 41],
        shadowAnchor: [13, 40]
    });
    scootCargoIconSelected = L.icon({
        iconUrl: '//scoot.co/map/assets/scootMarker_cargo_white_selected.png',
        iconSize: [24, 24], // size of the icon
        iconAnchor: [13, 40], // point of the icon which will correspond to marker's location
        popupAnchor: [0, -42], // point from which the popup should open relative to the iconAnchor        
        shadowUrl: '',//'//scoot.co/map/assets/marker_shadow.png',
        shadowSize: [41, 41],
        shadowAnchor: [13, 40]
    });
    scootQuadIcon = L.icon({
        iconUrl: '//scoot.co/map/assets/scootMarker_quad_white.png',
        iconSize: [24, 24], // size of the icon
        iconAnchor: [13, 40], // point of the icon which will correspond to marker's location
        popupAnchor: [0, -42], // point from which the popup should open relative to the iconAnchor        
        shadowUrl: '',//'//scoot.co/map/assets/marker_shadow.png',
        shadowSize: [41, 41],
        shadowAnchor: [13, 40]
    });
    scootQuadIconSelected = L.icon({
        iconUrl: '//scoot.co/map/assets/scootMarker_quad_white_selected.png',
        iconSize: [24, 24], // size of the icon
        iconAnchor: [13, 40], // point of the icon which will correspond to marker's location
        popupAnchor: [0, -42], // point from which the popup should open relative to the iconAnchor        
        shadowUrl: '',//'//scoot.co/map/assets/marker_shadow.png',
        shadowSize: [41, 41],
        shadowAnchor: [13, 40]
    });                   
}

function addLocationMarker(data, showAtHalfOpacity, replaceIfFound) {
    if (!map) console.log('\t\t!!!!!!!! no map yet, cannot place location markers');
    if (!map) return;
    
    var marker;
    var popupOptions = {
        'closeButton': false,
        'closeOnClick': true
    };
    // get public scoots
    var scoots_available = data.public_scoots;
    // pluralize "scoot" if not one scoot
    var scoot_or_scoots = "scoot";
    if (scoots_available != 1) scoot_or_scoots = "scoots"; // 0 scoots, 1-n scoots


    // add lat/lon, icon style
    // place garage marker at lat/long with Garage Icon only if it is 'Public' (aka Garage)
    // also if the 'access mask' is '43845' that means it's coming soon so hide it
	if ((data.style === "public") && (data.access_mask !== 43845)) {

	    marker = L.marker([data.latitude, data.longitude], { icon: scootGarageIcon });
        marker.data = data;

        // add popup
        marker.addTo(map).bindPopup("<h3>" + data.name.replace('&', ' & ') + "</h3><p>" + scoots_available + " " + scoot_or_scoots + " available now.</p><p>Parking for up to " + data.capacity + ".", popupOptions);

        // add marker to map
        marker.addTo(map);
        locationMarkers.push(marker);
        return marker;    
 
    // if it's a 'scoot stop' do something else / commented out because we are now returning actual scoot zone data so this is unnecessary         
    } else if (data.style === "scoot_stop") {

        //If it is a 'Scoot Stop' do something else / currently commented out because we're adding the Scoots directly
        //marker = L.marker([data.latitude, data.longitude], { icon: scootGarageIcon });

    } else {
	    //marker = L.marker([data.latitude, data.longitude], { icon: scootStopIcon });
    }

}

function addScooterMarker(data, showAtHalfOpacity, replaceIfFound) {
    if (!map) console.log('\t\t!!!!!!!! no map yet, cannot place location markers');
    if (!map) return;

    var marker;
    var popupOptions = { 'closeButton': false};
    var vehRange = Math.floor(data.estimated_range);
    var vehType = '';
    //if it's a special type of scoot, call it that, otherwise it's just 'Scoot'
    if (data.vehicle_type.id !== 6) { 
        vehType = data.vehicle_type.name;
    } else {
        vehType = '';
    }

    // Place Scoot marker at lat/lon - Swap icon depending on vehicles types -
    if (data.vehicle_type.name === "Scoot") {
        marker = L.marker([data.latitude, data.longitude], { icon: scootIcon, zIndexOffset: -100 });
    } else if (data.vehicle_type.name === "Classic") {
        marker = L.marker([data.latitude, data.longitude], { icon: scootClassicIcon, zIndexOffset: -100 });
    } else if (data.vehicle_type.name === "Cargo") {
        marker = L.marker([data.latitude, data.longitude], { icon: scootCargoIcon, zIndexOffset: -100 });
    } else if (data.vehicle_type.name === "Quad") {
        marker = L.marker([data.latitude, data.longitude], { icon: scootQuadIcon, zIndexOffset: -100 });
    } else {  //default to regular Scoot icon
        marker = L.marker([data.latitude, data.longitude], { icon: scootIcon, zIndexOffset: -100 });
    }    

    // add marker to map, unless they're Quads  
    if (data.vehicle_type.name !== "Quad") {
        marker.data = data;

        // add popup
        marker.addTo(map).bindPopup("<h3>Scoot " + vehType + " #" + data.public_name + "</h3><p>Range: " + vehRange + "mi.</p>", popupOptions);

        marker.addTo(map);
        locationMarkers.push(marker);
        return marker;
    }
}

function placeGarageMarkers() {
    scootGarages = latestLocationsData;

    // define the styles
    var scootStopStyle = {
        "color": "#33CCFF",
        "weight": 0,
        "opacity": 0,
        "fillColor": "#33CCFF",
        "fillOpacity": 0.3            
    };
    var scootZoneStyle = {
        "color": "#00c2eb",
        "weight": 0,
        "opacity": 0.65,
        "fillColor": "#00c2eb",
        "fillOpacity": 0.4            
    };

    //define the variables for the upcoming geoJsonLayer functions
    var addGeoJsonLayer = false;
    var geoJsonLayer;
    var geofenceLayer;
    var SCOOT_STOP_ZOOM = 0;


    for (var l = 0; l < scootGarages.length; l++) {
        if ((scootGarages[l].latitude !== 0) && (scootGarages[l].longitude !== 0)) {
        //console.log(l, scootGarages[l].name, scootGarages[l].name, scootGarages[l].latitude, scootGarages[l].longitude);
   
            // Runs the main addLocationMarker function to add the Scoot Garages
            addLocationMarker(scootGarages[l], false, false);

            // Get the geoJson layers ready
            if (!geoJsonLayer)
            {
                geoJsonLayer = L.geoJson();
                geofenceLayer = L.geoJson();

                addGeoJsonLayer = true;
                geoJsonLayer.addTo(map);
            }

            // Places a blue zone over areas that are considered 'Scoot Zones' - adds to its own layer, geofenceLayer
            if (scootGarages[l].geoJson !== null) { 
                var parsedGarages = jQuery.parseJSON(scootGarages[l].geofence_geojson);
                L.geoJson(parsedGarages, {
                    style: scootStopStyle,
                    onEachFeature: function (feature, layer) {
                       geofenceLayer.addLayer(layer);
                    }
                });
                if (map && map.getZoom() > SCOOT_STOP_ZOOM)
                {
                    geofenceLayer.addTo(map);
                }
            }
            
            //
            // Places darker blue lines on specific streets you can park anywhere - adds to its own layer, geoJsonLayer
            // Commented out until the parking dots or zoom levels work 
            //

            // if (scootGarages[l].geoJson !== null) { 
            //     var parsedScootZone = jQuery.parseJSON(scootGarages[l].geojson);
            //     L.geoJson(parsedScootZone, {
            //         style: scootZoneStyle,
            //         onEachFeature: function (feature, layer) {
            //            geoJsonLayer.addLayer(layer);
            //         }
            //     });
            //     if (map && map.getZoom() > SCOOT_STOP_ZOOM)
            //     {
            //         geoJsonLayer.addTo(map);
            //     }
            // }

            // Works - populates like a million markers for the parking spots. need to be styled or icon'd
            // if (scootGarages[l].location_type.id == 4) { 
            //     var parsedParkingGeoJson = jQuery.parseJSON(scootGarages[l].parking_geojson);
            //     L.geoJson(parsedParkingGeoJson, {
            //     style: myStyle
            //     }).addTo(map);
            //     console.log(parsedParkingGeoJson + " " + l);
            // }   

            // Map code to define where and how layers get shown -- where does this go?? Needs to be implemented still
            // map.on('zoomend', function () {
            //     if (map.getZoom() > 13 && map.hasLayer(geofenceLayer)) {
            //         map.removeLayer(geofenceLayer);
            //     }
            //     if (map.getZoom() < 17 && map.hasLayer(geofenceLayer) === false)
            //     {
            //         map.addLayer(geofenceLayer);
            //     }   
            // });         
        }
    }
}


function placeScooterMarkers() {
    scooterVehicles = latestScooterData;

    for (var l = 0; l < scooterVehicles.length; l++) {
        if ((scooterVehicles[l].latitude !== 0) && (scooterVehicles[l].longitude !== 0)) {
            addScooterMarker(scooterVehicles[l], false, false);
            //console.log('function running and adding scooters number #' + l);
        }
    }
}

function initializeMapLeaflet() {

    //calc max bounds:
    var northEast = new L.LatLng(37.852628, -122.327271);
    var southWest = new L.LatLng(37.67322310137699, -122.52742767333983);
    var bounds = new L.LatLngBounds(southWest, northEast);

    var mapOptions = {
        center: [DEFAULT_POSITION_LAT, DEFAULT_POSITION_LNG],
        // trackResize: true
        maxZoom: MAP_MAX_ZOOM,
        minZoom: MAP_MIN_ZOOM,
        zoom: MAP_INITIAL_ZOOM,
        maxBounds: bounds, //comment or uncomment to disable / enable bounds enforcement (bounce-back)
        // fadeAnimation: false,
        doubleClickZoom: false,
        zoomAnimation: true,
        markerZoomAnimation: false,
        attributionControl: false,
        bounceAtZoomLimits: false
    };

    map = L.map('map_canvas', mapOptions);

    // var retina = window.devicePixelRatio >= 2;
    var retina = L.Browser.retina;
    var TILES_URL;
    if (retina) {
        //retina
        TILES_URL = "https://a.tiles.mapbox.com/v4/scoottech.18dca8a1/{z}/{x}/{y}@2x.png?access_token=pk.eyJ1Ijoic2Nvb3R0ZWNoIiwiYSI6IlBMTjNqVTgifQ.r8a_cZRmGF_GIOKIKaK1dA";
        // Retina tiles are sized 1/2 of normal tiles for twice the pixel
        // density
    } else {
        //standard
        TILES_URL = "https://a.tiles.mapbox.com/v4/scoottech.18dca8a1/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoic2Nvb3R0ZWNoIiwiYSI6IlBMTjNqVTgifQ.r8a_cZRmGF_GIOKIKaK1dA";
        // use a standard tileset
    }

    var tileLayer = L.tileLayer(
        TILES_URL,
        //MY_URL,
        {
            center: [DEFAULT_POSITION_LAT, DEFAULT_POSITION_LNG],
            detectRetina: true,
            unloadInvisibleTiles: false
        }).addTo(map);

    /*     map.doubleClickZoom.disable(); */
}


//
// map routing
//
function getLineStyle(mode) {
    switch (mode) {
        case 'scoot':
            return {
                color: '#41A3E4',
                weight: 8,
                opacity: 0.6
            };
            break;
        case 'walkToScoot':
        case 'walkFromScoot':
            return {
                color: '#41A3E4',
                weight: 5,
                opacity: 1,
                dashArray: [5, 8],
				  lineJoin: 'round',
				  smoothFactor: 2
            };
            break;
        case 'taxi':
            return {
                opacity: 0
            };
            break;
    }
}

/* ++++++++++++++++ajax calls for address to lat- long conversion +++++++++++++++++++++++ */
var vis;
var vis2;
var vis3;
var vis4;
var name_end;
var startMarker = null;
var endMarker = null;
var lat_1;

function getCoords() {
	$('form').submit(function(event) {
     
		//reset data if a map has been drawn
		      
        var formData = {
            'name'              : $('input[name=address]').val(),
			'end'				: $('input[name=address_end]').val(),
        };
		var name2 = $('input[name=address]').val();
		name_end = $('input[name=address_end]').val();
		
		//simple form validation ... check for fields that aren't addresses.. if pass, then send ajax requests
		if ((name2 === '' )||(name2 == 'Start' )){
    		$('input[id=add_1]').val('Enter where you are');
    		$('input[id=add_1]').css('color', '#ff0000');
    		$('input[id=add_1]').css('font-style', 'italic');
		} else if ((name_end === '' )||(name_end == 'End' )){
    		$('input[id=add_2]').val('Enter where you are going');
    		$('input[id=add_2]').css('color', '#ff0000');
    		$('input[id=add_2]').css('font-style', 'italic');
		} else {
		
			
		//validate for 'San Francisco' in search queries...necessary to find correct lat/long constrained to the City
		var str2 = "San Francisco";
		if(name2.indexOf(str2) == -1){
			name2 += ' ' + str2;
		}
		
		if(name_end.indexOf(str2) == -1){
			name_end += ' ' + str2;
		}
		
		routeBetweenLocations(name_end);
        // process the form
        $.ajax({
            type        : 'GET', 
            url         : "//api.tiles.mapbox.com/v4/geocode/mapbox.places/"+name2+".json?proximity=-122.433357,37.771732&access_token=pk.eyJ1Ijoic2Nvb3R0ZWNoIiwiYSI6IlBMTjNqVTgifQ.r8a_cZRmGF_GIOKIKaK1dA", // the url where we want to POST
            data        : formData, // our data object
            dataType    : 'json', // what type of data do we expect back from the server
            encode     : true
        })
            .done(function(data) {
				vis = data.features[0].geometry.coordinates[0];
				vis2 = data.features[0].geometry.coordinates[1];
				 $("#latitute").text(vis);
				 $("#longitude").text(vis2);
				 
				 //add start marker
                 var marker = new L.marker([vis2,vis], {
                                draggable: false
                            });
							startMarker = marker;
                            marker.setIcon(startMarkerIcon);
							map.addLayer(marker);
							findNearestScoot(marker);	
            });
			
			//second ajax call for end address
			setTimeout(function(){
			$.ajax({
            type        : 'GET', // define the type of HTTP verb we want to use (POST for our form)
            url         : "//api.tiles.mapbox.com/v4/geocode/mapbox.places/"+name_end+".json?proximity=-122.433357,37.771732&access_token=pk.eyJ1Ijoic2Nvb3R0ZWNoIiwiYSI6IlBMTjNqVTgifQ.r8a_cZRmGF_GIOKIKaK1dA", // the url where we want to POST
            data        : formData, // our data object
            dataType    : 'json', // what type of data do we expect back from the server
            encode          : true
        })
            // using the done promise callback
            .done(function(data) {
				vis3 = data.features[0].geometry.coordinates[0];
				vis4 = data.features[0].geometry.coordinates[1];
				 $("#latitute2").text(vis3);
				 $("#longitude2").text(vis4);
				 
				 
				  //add end marker
                 var marker = new L.marker([vis4,vis3], {
                                draggable: false
                            });
							endMarker = marker;
                            marker.setIcon(endMarkerIcon);
							map.addLayer(marker);
							findNearestScootEnd(marker);
                            // findNearestScoot(marker);
            });			
		 
			},800);
		 
		//end the form validation here
		}
		
		
			
		    // stop the form from submitting the normal way and refreshing the page
        event.preventDefault();
		
		results_map = 1;
		//alert(results_map);
		setTimeout(function(){
		 //write addresses to MySQL DB:
		 var formData2 = {
            'name'              : $('input[name=address]').val(),
			'lat_1'				: $('#latitute').text(),
			'long_1' 			: $('#longitude').text(),
			'end'				: $('input[name=address_end]').val(),
			'lat_2'				: $('#latitute2').text(),
			'long_2' 			: $('#longitude2').text()
        };
		
		
		 $.ajax({
				 type: "POST",
                url: "//scoot.co/map/process.php",
                data: formData2,
				error: function(xhr, status, error) {
  					var err = eval("(" + xhr.responseText + ")");
  					alert(err.Message);
				},
                success: function(msg){
                    //alert ('check db')
                }

            });
			},2400);
		 //end writing address to MySQL DB
    });
	                          
	/* ++++++++++++++++end ajax calls for address to lat- long conversion +++++++++++++++++++++++ */
 };



//MAPBOX DIRECTIONS
function routeBetweenLocations(locationOne, locationTwo, mode, smartDirections) {
    //get lat longs
    if (!locationOne || !locationTwo) return;
    /*   if (!locationOne.data || !locationTwo.data) return; */
	
	//console.log(locationOne, locationTwo, mode, smartDirections);
	/*+++++++++++++++++++++variables now taken from ajax calls++++++++++++++++++++++++++*/
	
    var lng1 = locationOne._latlng.lng;
    var lat1 = locationOne._latlng.lat;
    var lng2 = locationTwo._latlng.lng;
    var lat2 = locationTwo._latlng.lat;
	
    var pointsString = lng1 + "," + lat1 + ";" + lng2 + "," + lat2;
//Get directions form Mapbox, if Smartdirections is true than map Scoot directions, if false, get Mapbox walking directions:
    if (smartDirections) {
        var url = "https://api.tiles.mapbox.com/v3/scoottech.map-7susygol/directions/driving/" + pointsString + ".json?geometry=geojson";
    } else {
        var url = "https://api.tiles.mapbox.com/v4/directions/mapbox.walking/" + pointsString + ".json?access_token=pk.eyJ1Ijoic2Nvb3R0ZWNoIiwiYSI6IlBMTjNqVTgifQ.r8a_cZRmGF_GIOKIKaK1dA";
    }

	
	
	
    $.ajax({
        type: 'GET',
        dataType: 'json',
        url: url,
        cache: false, // browser cache these values
        success: function(response) {
            //      console.log('=== mapbox directions call success ===');

            //parse json
            // console.log(response);
            var e = response;

            //protect against no route found:
            if (!e.routes || e.routes.length === 0) {
                console.log("No routes found");
                return;
            }

            var line = new Array();

            if (e.routes.length > 0) {
                for (var i = 0; i < e.routes[0].geometry.coordinates.length; i++) {
                    line.push([e.routes[0].geometry.coordinates[i][1], e.routes[0].geometry.coordinates[i][0]]);
                    if (e.routes[0].geometry.coordinates.length - 1 == i) {

                        //get line style based on mode
                        var polyline_options = getLineStyle(mode);
                        var polyline = L.polyline(line, polyline_options).addTo(routeLayerGroup);
                        map.addLayer(routeLayerGroup);
                    }
                }
                //        console.log('=== parsed routing json ===');

                var thisResponse = e;

                thisResponse.mode = mode; //add mode to responses

                switch (thisResponse.mode) { //add routeSpeed to responses based on mode
                    case 'scoot':
                        thisResponse.routeSpeed = ROUTE_SCOOTING_SPEED;
                        break;
                    case 'walkToScoot':
                    case 'walkFromScoot':
                        thisResponse.routeSpeed = ROUTE_WALKING_SPEED;
                        break;
                    case 'taxi':
                        thisResponse.routeSpeed = ROUTE_TAXI_SPEED;
                        break;
                }

                allDirections.push(thisResponse); //then add to array of scoot route directions    
                //console.log(allDirections.length);   

                //do distance and time math when we have 3 sets of directions returned from mapbox (2 walking, 1 scooting)
                if (allDirections.length === 4) {
                //if (allDirections.length >= 3) { //if eliminate the non-utilized taxi route

                    var scootDirectionsTime = 0;
                    var scootDirectionsDistance = 0;
                    var scootCost = 3; //currently flat rate of $3
                    var scootMorethan30Cost = 0; //add in variable to calculate additional 10c/min, default zero
                    var scootTime = 0;
                    var walkToScootTime = 0;
                    var walkFromScootTime = 0;
                    var taxiDirectionsTime = 0;
                    var taxiDirectionsDistance = 0;
                    var taxiDirectionsCost = 0;
                    var additionalFifths = 0;

                    // cycle directions
                    for (i = 0; i < allDirections.length; i++) {
                        //set .calculatedTime for each set of directions, based on first route, (route[0]), of each
                        allDirections[i].calculatedTime = (allDirections[i].routes[0].distance * 0.000621371) / allDirections[i].routeSpeed * 60;

                        //console.log(allDirections[i].mode + ": " + (allDirections[i].routes[0].distance * 0.000621371).toFixed(2) + " miles @ " + allDirections[i].routeSpeed + "mph = " + allDirections[i].calculatedTime.toFixed(2) + "min");

                        //total scoot trip (walk, scoot, walk)
                        if ((allDirections[i].mode === 'scoot') || (allDirections[i].mode === 'walkToScoot') || (allDirections[i].mode === 'walkFromScoot')) {
                            scootDirectionsTime = scootDirectionsTime + allDirections[i].calculatedTime;
                            scootDirectionsDistance = scootDirectionsDistance + allDirections[i].routes[0].distance;
                            switch (allDirections[i].mode) {
                                case 'walkToScoot':
                                    walkToScootTime = allDirections[i].calculatedTime;
                                    break;
                                case 'scoot':
                                    scootTime = allDirections[i].calculatedTime;
                                    break;
                                case 'walkFromScoot':
                                    walkFromScootTime = allDirections[i].calculatedTime;
                                    break;
                            }
                            //total taxi trip and taxi fare	
                        } else if (allDirections[i].mode === 'taxi') {
                            taxiDirectionsTime = allDirections[i].calculatedTime;
                            taxiDirectionsMiles = allDirections[i].routes[0].distance * 0.000621371;
                            //console.log("div = " + Math.floor((taxiDirectionsMiles) / .2)); //full 1/5 miles
                            //console.log("mod = " + Math.ceil((taxiDirectionsMiles) % .2)); //any part of 1/5 mile
                            additionalFifths = Math.floor((taxiDirectionsMiles) / 0.2) + Math.ceil((taxiDirectionsMiles) % 0.2) - 1; //full 1/5 miles + any part of 1/5 mile - 1st 1/5
                            //console.log("additionalFifths =" +  additionalFifths); 
                            taxiDirectionsCost = (TAXI_RATE_FIRST + (additionalFifths * TAXI_RATE_FIFTHS));
                            //console.log("Taxi fare = $" + Math.ceil(taxiDirectionsCost));
                        }
                    }
                    //console.log("total scoot time = " + scootDirectionsTime.toFixed(2) + ", distance = " + (scootDirectionsDistance * 0.000621371).toFixed(2));

                    // display results in html under map
                    //conditionally check if it contains garage property (else is probably a vehicle and garage data returns undefined)                    
                    if ((startGarage !== null) && (startGarage.data.style === 'public')) { 
                        $('#scoot_route').html('<span class="route-text">Scoot Route<br /><span class="start-to-end-text"><span class="scoot-text">Walk ' + Math.round(walkToScootTime) + ' mins to <strong>' + startGarage.data.name.replace('&', ' & ') + '</strong>. <br /><strong>Scoot</strong> ' + Math.round(scootTime) + ' mins to <strong>' + endGarage.data.name.replace('&', ' & ') + '</strong>. <br />Walk ' + Math.round(walkFromScootTime) + ' mins to destination.</span></span></span>' + Math.round(scootTime) + ' mins (plus ' + (Math.round(walkToScootTime) + Math.round(walkFromScootTime)) + ' mins walking) <span class="trip-cost">$' + Math.ceil(scootCost) + '</span>');
                    } else { 
                        $('#scoot_route').html('<span class="route-text">Scoot Route<br /><span class="start-to-end-text"><span class="scoot-text">Walk ' + Math.round(walkToScootTime) + ' mins to <strong>Scoot</strong>. <br /><strong>Scoot</strong> ' + Math.round(scootTime) + ' mins to <strong>' + endGarage.data.name.replace('&', ' & ') + '</strong>. <br />Walk ' + Math.round(walkFromScootTime) + ' mins to destination.</span></span></span>' + Math.round(scootTime) + ' mins (plus ' + (Math.round(walkToScootTime) + Math.round(walkFromScootTime)) + ' mins walking) <span class="trip-cost">$' + Math.ceil(scootCost) + '</span>');
                    }
                    $('#taxi_route').html('<span class="route-text">Taxi Route</span>' + Math.round(taxiDirectionsTime) + ' mins (NOT incl. wait time) <span class="trip-cost">$' + Math.ceil(taxiDirectionsCost) + ' (NOT incl. tip)</span>');

                    $('#scoot_savings').html('<span class="savings-text">Scooting saves $' + (Math.ceil(taxiDirectionsCost) - Math.ceil(scootCost)) + '!</span>');



                    //  ([taxi fare] - [scoot fare]) x 60/([scoot time including walking] - [taxi time]);
                    var wage = (Math.ceil(taxiDirectionsCost) - Math.ceil(scootCost)) * 60 / ((Math.round(scootTime) + Math.round(walkToScootTime) + Math.round(walkFromScootTime)) - Math.round(taxiDirectionsTime));
						
                    $('#wage_comparison').html('You should scoot this route if you like having fun or want to save $' + Math.round(wage) + '/hour.');
					
					//lop off city and state from search query by getting rid of everything after the first ","
					name_end = name_end.split(",")[0];
					name_end = name_end.replace("San Francisco", "");

					//shorten dynamic results by putting a character limit cap with ellipsis so that results stay on one line per direction
					if(name_end.length > 20) name_end  = name_end.substring(0,20-3)+"...";
                    
                    //conditionally check if it contains garage property (else is probably a vehicle)
                    if ((startGarage !== null) && (startGarage.data.style === 'public')) { 
                        if(startGarage.data.name.length > 26) startGarage.data.name  = startGarage.data.name.substring(0,26-3)+"..."; 
                    }
					if(endGarage.data.name.length > 22) endGarage.data.name  = endGarage.data.name.substring(0,22-3)+"...";

					//scoot box html here for geocoding
                    //conditionally check if it contains garage property (else is probably a vehicle)
                    if ((startGarage !== null) && (startGarage.data.style === 'public')) { 
					   $('.results-form').html('<div>Walk ' + Math.round(walkToScootTime) + ' mins to ' + startGarage.data.name.replace('&', ' & ') + ' </div><div>Pick up your scoot</div><div>Ride ' + Math.round(scootTime) + ' minutes</div><div>Drop off scoot at ' + endGarage.data.name.replace('&', ' & ') + '</div><div>Walk ' + Math.round(walkFromScootTime) + ' minutes to '+ name_end +'</div>');
                    } else {
                       $('.results-form').html('<div>Walk ' + Math.round(walkToScootTime) + ' mins to Scoot.</div><div>Pick up your scoot</div><div>Ride ' + Math.round(scootTime) + ' minutes</div><div>Drop off scoot at ' + endGarage.data.name.replace('&', ' & ') + '</div><div>Walk ' + Math.round(walkFromScootTime) + ' minutes to '+ name_end +'</div>');                        
                    }

                    var total_time = Math.round(walkToScootTime) + Math.round(scootTime) + Math.round(walkFromScootTime);
                    var currentTime = new Date();
                        currentHour = currentTime.getHours(); currentMin = currentTime.getMinutes();

                    // If the trip takes more than 30 min, add 10cents/min. Mathematically this should be factored only into the ride time, but in practice total time is a more accurate cost prediction
                    if (total_time > 30) { 
                        scootMorethan30Cost = (total_time - 30) * 0.1; 
                        $('.cost-bubble').html(''+total_time + ' min.   ~$'+ (scootCost + scootMorethan30Cost).toFixed(2));
                    }                  
                    else {
                        $('.cost-bubble').html(''+total_time + ' min.   ~$'+ (scootCost).toFixed(2));
                    }
                    // If current time is during commute hours, add $2 and highlight the commute blurb
                    if ((currentHour >= 7 && currentHour <= 9) || (currentHour >= 16 && currentHour <= 18)) {
                        $('.cost-bubble').append('<span> +$2</span>');
                        $('p.commuteBlurb').css('color','red');  
                    }

                    // Add blurb for commute hours
                    $('p.commuteBlurb').html('+$2 during commute hours');
                    $('p.commuteBlurbHours').html('7am-10am and 4pm-7pm');				
					$('.taxi-ride').html('estimated taxi ride: $' + Math.ceil(taxiDirectionsCost) + '.00');
					$('#scoot-box').css('display', 'block');
					$('#ride-today').css('display', 'block');
                    $('#map_results').css('display', 'block');
					
					//fire mobile results if window size less than 600
					var windowsizer = $(window).width();
        				if (windowsizer <600)
        				{ mobileresults();}
   							
                } else if (allDirections.length > 4)  { 
                    //alert('more than4!');
                }
            }
        },
        error: function(xhr, textStatus, errorThrown) {
            console.log('=== ERROR: calling mapbox directions ===');
            console.log(errorThrown);
            if (textStatus == 'timeout') {
                this.tryCount++;
                if (this.tryCount <= MAX_AJAX_CALL_RETRIES) {
                    //retry
                    console.log("== retry " + this.tryCount + "==");
                    $.ajax(this);
                    return;
                }
            } else {
                // do nothing since this doesn't break affect anything else
            }
        }
    });
}


// return distance in meters
function distance(lat1, lon1, lat2, lon2) {
    var x = 69.1 * 1609.34 * (lat2 - lat1);
    var y = 69.1 * 1609.34 * (lon2 - lon1) * Math.cos(lat1 / 57.3);
    return Math.sqrt(x * x + y * y);
}


function clearRoutingPaths() {
    routeLayerGroup.clearLayers();
}

//mobile form results function
function mobileresults() {
var maxScrollLeft = $(window).width();
if (maxScrollLeft <600)
        				{
maxScrollLeft = maxScrollLeft * 2;
var formwrapwidth =  $('#form-wrap').width();
    $('#mobile-results').css('display', 'block');
	$('#mobile-results').css('width', '100%');
	$('#address_form').css('width', '100%');
	$('#planaride').css('width', '100%');
	$('#form-wrap').animate({scrollLeft: formwrapwidth}).promise().done(function ()
{
    $('#form-wrap ').css('overflow-x', 'hidden');
	$('#address_form').css('display', 'none');
	$('body').animate({
        scrollTop: 0
    }, 0);
	 
});
	}
}

function findNearestScoot(marker) {
    var shortestDistanceSoFar = 40075000; // meters (large distance = circumference of earth)
    var markerLatLon = marker.getLatLng();

    // //cycle through scooterVehicles scooters.json data to find nearest
    for (var i = 0; i < scooterVehicles.length; i++) {
        //if ((scootGarages[i].latitude !== 0) && (scootGarages[i].style === "public")) { //if you switch this back to garage make sure style is public
         if (scooterVehicles[i].latitude !== 0) { //original vers. new vers. checks to ensure it's a garage stop
            var distanceToMarker = distance(scooterVehicles[i].latitude, scooterVehicles[i].longitude, markerLatLon.lat, markerLatLon.lng);
            if (distanceToMarker < shortestDistanceSoFar) {
                shortestDistanceSoFar = distanceToMarker;
                closestScootID = scooterVehicles[i].id;
            }
        }
    }

    //console.log('shortest distance so far from vehicles is:' + shortestDistanceSoFar + 'and scoot ID is ' + closestScootID);

    //cycle through scootGarages to find nearest - needs refinement. may not be necessary if final data puts scoots on garages.
    for (var n = 0; n < scootGarages.length; n++) {
        if ((scootGarages[n].latitude !== null) && (scootGarages[n].num_available_scooters > 0)) {
            var distanceToGarageMarker = distance(scootGarages[n].latitude, scootGarages[n].longitude, markerLatLon.lat, markerLatLon.lng);
            //console.log(distanceToGarageMarker);
            if ((distanceToGarageMarker < shortestDistanceSoFar) && (scootGarages[n].location_type.id !== 4) ){
                //console.log('distance from scooter is:' + shortestDistanceSoFar + ', and distance form garage is:' + distanceToGarageMarker + 'so scoot garage ID is ' + scootGarages[n].id);
                shortestDistanceSoFar = distanceToGarageMarker;
                closestScootID = scootGarages[n].id;
                isGarage = true;
                i = n;
            }
        }
    }

    //cycle markers to find the one identified above, then highlight it
    for (var i = 0; i < locationMarkers.length; i++) {
        //if ((locationMarkers[i].data.id == closestScootID) || (locationMarkers[i].data.id == closestScootID)) {
        if (locationMarkers[i].data.id == closestScootID) {	        
            //console.log('closestScootID is ' + closestScootID);console.log('locationMarkers[i] is ' + locationMarkers[i].data.id);

            //give it an icon    
			if (locationMarkers[i].data.style === "public") {
	            locationMarkers[i].setIcon(scootGarageSelectedIcon);
            // } else if (locationMarkers[i].scooters.vehicle_type.name === "Scoot") {
            //     marker = L.marker([data.latitude, data.longitude], { icon: scootIconSelected, zIndexOffset: -100 });                
            // } else if (locationMarkers[i].scooters.vehicle_type.name === "Classic") {
            //     marker = L.marker([data.latitude, data.longitude], { icon: scootClassicIconSelected, zIndexOffset: -100 });
            // } else if (locationMarkers[i].scooters.vehicle_type.name === "Cargo") {
            //     marker = L.marker([data.latitude, data.longitude], { icon: scootCargoIconSelected, zIndexOffset: -100 });
            // } else if (locationMarkers[i].scooters.vehicle_type.name === "Quad") {
            //     marker = L.marker([data.latitude, data.longitude], { icon: scootQuadIconSelected, zIndexOffset: -100 });
            } else {
	            //locationMarkers[i].setIcon(scootStopSelectedIcon);
                locationMarkers[i].setIcon(scootIconSelected);
			}        

            // highlight start or end garage; and map routes if end 
            if (startGarage === null) {
				 startGarage = locationMarkers[i];
				 routeBetweenLocations(startMarker, startGarage, 'walkToScoot', false);
                 //console.log('i ran startGarage === null r1');

            }
        } else { 
            //console.log('dat aint right');
        }
    }
    return closestScootID;
}


function findNearestScootEnd(marker) {
    var shortestDistanceSoFar = 40075000; // meters (large distance = circumference of earth)
    var markerLatLon = marker.getLatLng();

    // cycle through scootGarages from locations.json to find nearest for end point
    for (var i = 0; i < scootGarages.length; i++) {
        if ((scootGarages[i].latitude !== 0) && (scootGarages[i].style === "public")) {
            var distanceToMarker = distance(scootGarages[i].latitude, scootGarages[i].longitude, markerLatLon.lat, markerLatLon.lng);
            if (distanceToMarker < shortestDistanceSoFar) {
                shortestDistanceSoFar = distanceToMarker;
                closestGarageID = scootGarages[i].id;
            }
        }
    }
    //console.log("i made it to here and shortestDistanceSoFar is" + shortestDistanceSoFar);console.log('closest garage ID is' + closestGarageID);

    //cycle markers to find garage listed above, then highlight it
    for (var i = 0; i < locationMarkers.length; i++) {
        if ((locationMarkers[i].data.id == closestGarageID) && (locationMarkers[i].data.style === 'public')) {
                
            // create Scoot Garage Stop icon at the end garage
            locationMarkers[i].setIcon(scootGarageSelectedIcon);
            //console.log(closestGarageID + 'is the closest garageID');

            //console.log('i ran EndGarage === null');console.log('startGarage is ' + startGarage);
            if (startGarage === null) { startGarage = locationMarkers[i]; }

            endGarage = locationMarkers[i];

            routeBetweenLocations(startGarage, endGarage, 'scoot', true);
            routeBetweenLocations(endGarage, endMarker, 'walkFromScoot', false);

            routeBetweenLocations(startMarker, endMarker, 'taxi', true);

            map.fitBounds([
                startMarker._latlng,
                endMarker._latlng
            ]);
        }
    }
}

//
// using getJSON -- trouble getting $.ajax to work from app server (though I think locally referenced copies worked);
// ... live server returns differently than staging
//
function getLocationsData(showAll) {
  //$.getJSON("https://scootstaging.herokuapp.com/api/v1/locations.json", function(result, textStatus, xhr) {
  $.getJSON("https://app.scootnetworks.com/api/v1/locations.json?callback=?", function(result, textStatus, xhr) {
    if (xhr && xhr.status) {
      //console.log(result);
      latestLocationsData = result['locations'];
      placeGarageMarkers();
    } else {
    console.log('aint nuthin there');
     // needs error handling
  }
  });
}

function getScooterData(showAll) {
  //$.getJSON("https://app.scootnetworks.com/api/v1/scooters.json?callback=?", function(result, textStatus, xhr) {
  $.getJSON("https://staging.scootnetworks.com/api/v1/scooters.json", function(result, textStatus, xhr) {
  //$.getJSON("http://localhost:8888/map/json/scooters.json", function(result, textStatus, xhr) {
    if (xhr && xhr.status) {
      //console.log(result);
      latestScooterData = result['scooters'];
      placeScooterMarkers();
     } else {
         // needs error handling
      }
  });
}

//
// go
//

  if ($('html').is('.ie9-or-less')) { //use static image of map with alert for IE less than v10
        $('#map_canvas').prepend('<img id="static_map" src="./assets/web_map-static.jpg" />');
        $('#map_canvas').on("click", function(e) {
            alert("When using Internet Explorer, you will need at least version 10 to try this demo!");
        });
    } else { //create regular map
        initializeIconsForMap();
        initializeMapLeaflet();
        getLocationsData();
        getScooterData();
        //  addClickMap();
		getCoords();
    }
	//

	//form resets and events
	$('input[id=add_1]').val('Start');
	$('input[id=add_2]').val('End');
	
	//blank field
	$('input[id=add_1]').focus(function() {
	 if(($(this).val() == 'Start')||($(this).val() == 'Enter where you are')){
            $(this).val(''); 
		}
    });
	 
	$('input[id=add_2]').focus(function() {
       if(($(this).val() == 'End')||($(this).val() == 'Enter where you are going')){
            $(this).val(''); 
		}
     });
		 
	//reset map markers, etc.
	$('input[type=text]').focus(function() {
        if (!startMarker) {
            //error handling
	    } else {

            //clear paths
            clearRoutingPaths();

            //remove selected garages
			if ((startGarage.data.style !== null) && (startGarage.data.style === "public")) {
                startGarage.setIcon(scootGarageIcon);
			} else {
                startGarage.setIcon(scootIcon);
			}
            startGarage = null;
			if (endGarage.data.style === "public") {
                endGarage.setIcon(scootGarageIcon);
			} else {
                endGarage.setIcon(scootStopIcon);
			}
            endGarage = null;

            //remove markers
            map.removeLayer(startMarker);
            startMarker = null;
            map.removeLayer(endMarker);
            endMarker = null;

            closestScootID = null;
            isGarage = null;  

			$('#scoot-box').css('display', 'none');
			$('#ride-today').css('display', 'none');
			$('.results-form').html('');
            $('.cost-bubble').html('');
            $('.taxi-ride').html('');
			allDirections = [];
		}	
		
    });
		 
	$('input[id=add_1]').on('keydown', function() {
			$(this).css('color', '#333');
			$(this).css('border', '1px solid #888');
			$(this).css('font-style', 'normal');
    });
		 
    $('input[id=add_2]').on('keydown', function() {
    		$(this).css('color', '#333');
    		$(this).css('border', '1px solid #888');
    		$(this).css('font-style', 'normal');
    });
    // $("#address_form")[0].reset();
	//end form resets and events
	
	//return to original start end adddress form screen:
    $("#arrow-back img").click(function(){
        var maxScrollRight = $(window).width();
        $('#address_form').css('display', 'inline-block');
        $('#form-wrap').animate({scrollRight: maxScrollRight}).promise().done(function ()
            {
                 $('#form-wrap ').css('overflow-x', 'hidden');	
            	 $('#mobile-results').css('display', 'none'); 
            	 $('#address_form').css('width', '92%');
        });
    });
});
