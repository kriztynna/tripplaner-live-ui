var itineraries = [];

function Day(){
  this.hotel = null;
  this.food = [];
  this.act = [];
}

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
  var map = new google.maps.Map(map_canvas_obj, mapOptions);
  map.mapTypes.set('map_style', styledMap);
  map.setMapTypeId('map_style');
  // Add the marker to the map
  var marker = new google.maps.Marker({
    position: myLatlng,
    title:"Hello World!"
  });

  function drawLocation (location, opts, markerList,bounds) {
    if (typeof opts !== 'object') {
      opts = {};
    }
    opts.position = new google.maps.LatLng(location[0], location[1]);
    // location[2] --> name
    opts.map = map;
    var marker = new google.maps.Marker(opts);
    markerList.push(marker);
    if (bounds) {bounds.extend(marker.position);}
  }

  var hotelMarker = [];
  var restaurantMarkers = [];
  var activityMarkers = [];

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

  // draw some locations on the map
  var hotelLocation = [];
  var restaurantLocations = [];
  var activityLocations = [];
  
  function drawAllLocations(hotelLocation,restaurantLocations,activityLocations) {
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




$("#addHotel").on("click",function(){
  var dayIndex = Number($('.current-day').text())-1;
  var value = $("#hotelList").val();
  var hotel = all_hotels[value];
  $("#hotelGroup").html('<li class="itinerary-item"><span class="title">'+hotel.name+'</span><button class="btn btn-xs btn-danger remove btn-circle">x</button></li>');
  itineraries[dayIndex].hotel = hotel;
  giraffe(dayIndex+1);
});

$("#addFood").on("click",function(){
  var dayIndex = Number($('.current-day').text())-1;
  var value = $("#foodList").val();
  var food = all_restaurants[value];
  $("#foodGroup").append('<li class="itinerary-item"><span class="title">'+food.name+'</span><button value="'+food.name+'"class="btn btn-xs btn-danger remove btn-circle">x</button></li>');
  itineraries[dayIndex].food.push(food);
  giraffe(dayIndex+1);
});

$("#addAct").on("click",function(){
  var dayIndex = Number($('.current-day').text())-1;
  var value = $("#actList").val();
  var act = all_activities[value];
  $("#actGroup").append('<li class="itinerary-item"><span class="title">'+act.name+'</span><button value="'+act.name+'" class="btn btn-xs btn-danger remove btn-circle">x</button></li>');
  itineraries[dayIndex].act.push(act);
  giraffe(dayIndex+1);
});

var dict = {"foodGroup": "food", "hotelGroup": "hotel", "actGroup": "act"};

$(".list-group").on("click",'.remove',function(){
  var dayIndex = Number($('.current-day').text())-1;
  var type = $(this).parent().parent().attr("id");
  var rightType = dict[type];
  var listToModify = itineraries[dayIndex][rightType];
  if (type==="hotelGroup") {
    itineraries[dayIndex][rightType]=null;
  }
  else {
    var name = $(this).val();
    var temp = itineraries[dayIndex][rightType].filter(function(a){return a.name!=name;});
    itineraries[dayIndex][rightType] = temp.map(function(a){return a;});

  }
  giraffe(dayIndex+1);
  $(this).parent().remove();
});

$("#addDay").on("click", function(){
  var number = $('.day-buttons button').length;
  $(this).before('<button class="btn btn-circle day-btn">'+ number +'</button>');
  itineraries.push(new Day());
});

$('.day-buttons').on('click', '.day-btn', function(){
  $('.day-btn').removeClass('current-day');
  $(this).addClass('current-day');
  var dayNumber = Number($(this).text());
  giraffe(dayNumber);
});

function giraffe(dayNum){
  var currentHotel = itineraries[dayNum-1].hotel;
  var currentFood = itineraries[dayNum-1].food;
  var currentAct = itineraries[dayNum-1].act;
  $('#day-title').html('<span>Day '+dayNum+'</span><button class="btn btn-xs btn-danger remove btn-circle">x</button>');
  
  $("#hotelGroup").html('');
  var hotelLocation = [];
  if (currentHotel){
    $("#hotelGroup").html('<li><span class="title">'+currentHotel.name+'</span><button class="btn btn-xs btn-danger remove btn-circle">x</button></li>');
    hotelLocation = [currentHotel.place[0].location[0],currentHotel.place[0].location[1]]; 
    }

  $("#foodGroup").html('');
  var restaurantLocations = [];
  if (currentFood.length){
    for (var i = 0; i < currentFood.length; i++){
    $("#foodGroup").append('<li><span class="title">'+currentFood[i].name+'</span><button value="'+currentFood[i].name+'"class="btn btn-xs btn-danger remove btn-circle">x</button></li>');
    restaurantLocations.push([currentFood[i].place[0].location[0],currentFood[i].place[0].location[1]]);
    }
  }
  $("#actGroup").html('');
  var activityLocations = [];
  if (currentAct.length){
     for (var j = 0; j < currentAct.length; j++){
    $("#actGroup").append('<li><span class="title">'+currentAct[j].name+'</span><button value="'+currentAct[j].name+'" class="btn btn-xs btn-danger remove btn-circle">x</button></li>');
    activityLocations.push([currentAct[j].place[0].location[0],currentAct[j].place[0].location[1]]);
    }
  }
  drawAllLocations(hotelLocation,restaurantLocations,activityLocations);
}

$('#day-title').on('click', '.remove', function(){
  var dayIndex = Number($('.current-day').text())-1;
  // if there's only 1 day left, we don't want it deleted
  if (itineraries.length>1) {
    itineraries.splice(dayIndex, 1); // this removes the day in question
    if (dayIndex !== itineraries.length){
      giraffe(dayIndex +1 );
      $('.day-buttons .day-btn').last().remove();
    }
    else {
      giraffe(dayIndex);
      $('.day-buttons .day-btn').last().remove();
      $('.day-buttons .day-btn').last().addClass('current-day');
    }    
  }
});


} //initialize gmaps

$(document).ready(function() {
  initialize_gmaps();
  itineraries.push(new Day());
});