// globals to be filled in on load
var map;
var itineraries;
// globals for maps
// coordinates
var hotelLocation = [];
var restaurantLocations = [];
var activityLocations = [];
// marker objects
var hotelMarker = [];
var restaurantMarkers = [];
var activityMarkers = [];
// end globals

// utility functions
function Day(){
  this.hotel = null;
  this.restaurants = [];
  this.activities = [];
}

function makeList (listID,items) {
  // first clear existing contents
  $(listID).html('');
  items.map(function(item){if (item) {$(listID).append('<li><span class="title">'+item.name+'</span><button value="'+item._id+'" class="btn btn-xs btn-danger remove btn-circle">x</button></li>');}});
}

function giraffe(dayNum){
  // get the itinerary data for the day in question
  var currentHotel = itineraries[dayNum-1].hotel;
  var currentFood = itineraries[dayNum-1].restaurants;
  var currentAct = itineraries[dayNum-1].activities;
  
  // update the DOM to show the newly selected day
  $('#day-title').html('<span>Day '+dayNum+'</span><button class="btn btn-xs btn-danger remove btn-circle">x</button>');
  
  // update the DOM to show the day's information
  makeList("#hotelGroup",[currentHotel]);
  makeList("#foodGroup",currentFood);
  makeList("#actGroup",currentAct);
  
  // prep data for the map
  if (currentHotel) {hotelLocation = [currentHotel.place[0].location[0],currentHotel.place[0].location[1]];}
  else { hotelLocation = []; }
  restaurantLocations = currentFood.map(function(food){return [food.place[0].location[0],food.place[0].location[1]];});
  activityLocations = currentAct.map(function(act){return [act.place[0].location[0],act.place[0].location[1]];});

  // update the map
  drawAllLocations(hotelLocation,restaurantLocations,activityLocations,map);
}
// end utility functions

// map drawing functions
function drawAllLocations(hotelLocation,restaurantLocations,activityLocations,map) {
  removeMarkers();
  if (hotelLocation.length || restaurantLocations.length || activityLocations.length) {
        var bounds = new google.maps.LatLngBounds();
        if (hotelLocation.length){
          drawLocation(hotelLocation, {icon: '/images/lodging_0star.png'}, hotelMarker, bounds);  
        }
      restaurantLocations.forEach(function (loc) {
        drawLocation(loc, {
          icon: '/images/restaurant.png'
        },restaurantMarkers,bounds);
      });
      activityLocations.forEach(function (loc) {
        drawLocation(loc, {
          icon: '/images/star-3.png'
        },activityMarkers,bounds);
      });
      map.fitBounds(bounds);
  }
}

function removeMarkers(){
  if (hotelMarker.length) {
    hotelMarker[0].setMap(null);
    hotelMarker.length=0;
  }
  if (restaurantMarkers.length) {
    restaurantMarkers.map(function(a){a.setMap(null);});
    restaurantMarkers.length = 0;
  }
  if (activityMarkers.length) {
    activityMarkers.map(function(a){a.setMap(null);});
    activityMarkers.length = 0;
  }
}

function drawLocation (location, opts, markerList,bounds) {
  if (typeof opts !== 'object') {
    opts = {};
  }
  opts.position = new google.maps.LatLng(location[0], location[1]);
  opts.map = map;
  var marker = new google.maps.Marker(opts);
  markerList.push(marker);
  if (bounds) {bounds.extend(marker.position);}
}
// end of map drawing functions

// click events
$("#addHotel").on("click",function(){
  var dayIndex = Number($('.current-day').text())-1;
  var value = $("#hotelList").val();
  console.log(dayIndex);
  console.log(value);
  $.ajax({
    method: 'GET',
    url: '/api/add/hotel/'+dayIndex+'/'+value,
    success: function (modifiedDay){itineraries[dayIndex]=modifiedDay;giraffe(dayIndex+1);},
    error: function (err) {console.log(err);}
  });
});

$("#addFood").on("click",function(){
  var dayIndex = Number($('.current-day').text())-1;
  var value = $("#foodList").val();
  $.ajax({
    method: 'GET',
    url: '/api/add/restaurants/'+dayIndex+'/'+value,
    success: function (modifiedDay){itineraries[dayIndex]=modifiedDay;giraffe(dayIndex+1);},
    error: function (err) {console.log(err);}
  });
});

$("#addAct").on("click",function(){
  var dayIndex = Number($('.current-day').text())-1;
  var value = $("#actList").val();
  var act = all_activities[value];
  $.ajax({
    method: 'GET',
    url: '/api/add/activities/'+dayIndex+'/'+value,
    success: function (modifiedDay){itineraries[dayIndex]=modifiedDay;giraffe(dayIndex+1);},
    error: function (err) {console.log(err);}
  });
});

var dict = {"foodGroup": "restaurants", "hotelGroup": "hotel", "actGroup": "activities"};

$(".list-group").on("click",'.remove',function(){
  var dayIndex = Number($('.current-day').text())-1;
  var type = $(this).parent().parent().attr("id");
  var rightType = dict[type];
  if (type==="hotelGroup") {var url = '/api/remove/'+rightType+'/'+dayIndex;}
  else {
    var value = $(this).val();
    var url = '/api/remove/'+rightType+'/'+dayIndex+'/'+value;
  }
  $.ajax({
      method: 'GET',
      url: url,
      success: function (modifiedDay){itineraries[dayIndex]=modifiedDay;giraffe(dayIndex+1);},
      error: function (err) {console.log(err);}
    });
});

$("#addDay").on("click", function(){
  var addBtn = $(this);
  $.ajax({
    method: 'GET',
    url: '/api/newday',
    success: function (data){
      itineraries=data;
      var number = data.length;
      addBtn.before('<button class="btn btn-circle day-btn">'+ number +'</button>');
    },
    error: function (err){console.log(err);}
  });
  itineraries.push(new Day());
});

$('.day-buttons').on('click', '.day-btn', function(){
  $('.day-btn').removeClass('current-day');
  $(this).addClass('current-day');
  var dayNumber = Number($(this).text());
  giraffe(dayNumber);
});

$('#day-title').on('click', '.remove', function(){
  var dayIndex = Number($('.current-day').text())-1;
  // if there's only 1 day left, we don't want it deleted
  if (itineraries.length>1) {
    $.ajax({
      method: 'GET',
      url: '/api/remove/day/'+dayIndex,
      success: function (remainingDays) {
        itineraries=remainingDays;
        if (dayIndex !== itineraries.length){
          giraffe(dayIndex +1 );
          $('.day-buttons .day-btn').last().remove();
        }
        else {
          giraffe(dayIndex);
          $('.day-buttons .day-btn').last().remove();
          $('.day-buttons .day-btn').last().addClass('current-day');
        }  
      },
      error: function (err) {console.log(err);}
    });    
  }
});
// end of click events

function initialize_gmaps() {
  var styleArr = [
    {
      stylers: [
        { hue: "#00ffe6" },
        { saturation: -20 }
      ]
    },{
      featureType: "road",
      elementType: "geometry",
      stylers: [
        { lightness: 100 },
        { visibility: "simplified" }
      ]
    },{
      featureType: "road",
      elementType: "labels",
      stylers: [
        { visibility: "off" }
      ]
    }
  ];
  var styledMap = new google.maps.StyledMapType(styleArr,
    {name: "Styled Map"});

  // initialize new google maps LatLng object
  var myLatlng = new google.maps.LatLng(40.705189,-74.009209);
  // set the map options hash
  var mapOptions = {
    center: myLatlng,
    zoom: 14,
    mapTypeControlOptions: {
      mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'map_style']
    }
  };

  // get the maps div's HTML obj
  var map_canvas_obj = document.getElementById("map-canvas");
  // initialize a new Google Map with the options
  map = new google.maps.Map(map_canvas_obj, mapOptions);
  map.mapTypes.set('map_style', styledMap);
  map.setMapTypeId('map_style');
  // Add the marker to the map
  var marker = new google.maps.Marker({
    position: myLatlng,
    title:"Hello World!"
  });

} //initialize gmaps


$(document).ready(function() {
  initialize_gmaps();
  $.ajax({
    method: 'GET',
    url: '/api/days',
    success: function (data){itineraries=data;giraffe(1);},
    error: function (err) {console.log(err);}
  });
});