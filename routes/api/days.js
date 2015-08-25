var express = require('express');
var router = express.Router();
var models = require('../../models');
var Hotel = models.Hotel;
var Restaurant = models.Restaurant;
var Activity = models.Activity;
var Day = models.Day;
var Trip = models.Trip;
var Promise = require('bluebird');

// list all the days
router.get('/days',function(req,res){
  //var fullDays = [];
  Day.find()
  .then(function(days){
    return Day.populate(days,[{path: 'hotel',model:'Hotel'},{path: 'restaurants',model:'Restaurant'},{path: 'activities',model:'Activity'}]);
  })
  .then(function(fullDays){res.json(fullDays);});
});

// list all the trips -- currently working with just one trip at any given time
router.get('/trips',function(req,res){
  Trip.find().then(function(trips){
    res.json(trips);
  });
});

// make a new day and add to trips
router.get('/newday',function(req,res){
  Trip.findOne({})
    .then(
      function(trip){
        var day = new Day();
        day.save()
          .then(function(day){
            trip.days.push(day._id);
            return trip.save(function(err,trip){res.redirect('./days');});
          });
        });
});

// remove an entire day by ID
router.get('/remove/day/ID/:id',function(req,res){
  Trip.findOne({})
    .then(function(trip){var idx = trip.days.indexOf(req.params.ID);trip.days.splice(idx,1);return trip.save()})
    .then(function(){return Day.findOneAndRemove({_id: req.params.id}).exec();})
    .then(function(removed){res.json(removed);});
});

// remove an entire day by index
router.get('/remove/day/:idx',function(req,res){
  Trip.findOne({})
    .then(function(trip){var id = trip.days[req.params.idx]; return Day.findOneAndRemove({_id: id}).exec(); })
    .then(function(){return Trip.findOne({});})
    .then(function(trip){trip.days.splice(req.params.idx,1);return trip.save()})
    .then(function(trip){res.redirect('/api/days');});
});

// set a hotel for a given day
router.get('/add/hotel/:dayIdx/:hotelID',function(req,res){
  Trip.findOne({})
    .then(function(trip){var id = trip.days[req.params.dayIdx]; return Day.findOne({_id: id}).exec(); })
    .then(function(day){day.hotel = req.params.hotelID; return day.save();})
    .then(function(day){
      return Day.populate(day,[{path:'hotel',model:'Hotel'},{path: 'restaurants',model:'Restaurant'},{path: 'activities',model:'Activity'}]);
    })
    .then(function(fullDay){res.json(fullDay);});
});

// add a restaurant for a given day
router.get('/add/restaurants/:dayIdx/:restaurantID',function(req,res){
  Trip.findOne({})
    .then(function(trip){var id = trip.days[req.params.dayIdx]; return Day.findOne({_id: id}).exec(); })
    .then(function(day){day.restaurants.push(req.params.restaurantID); return day.save();})
    .then(function(day){
      return Day.populate(day,[{path:'hotel',model:'Hotel'},{path: 'restaurants',model:'Restaurant'},{path: 'activities',model:'Activity'}]);
    })
    .then(function(fullDay){res.json(fullDay);});
});

// add an activity for a given day
router.get('/add/activities/:dayIdx/:activityID',function(req,res){
  Trip.findOne({})
    .then(function(trip){var id = trip.days[req.params.dayIdx]; return Day.findOne({_id: id}).exec(); })
    .then(function(day){day.activities.push(req.params.activityID); return day.save();})
    .then(function(day){
      return Day.populate(day,[{path:'hotel',model:'Hotel'},{path: 'restaurants',model:'Restaurant'},{path: 'activities',model:'Activity'}]);
    })
    .then(function(fullDay){res.json(fullDay);});
});

// remove a day's hotel
router.get('/remove/hotel/:dayIdx',function(req,res){
  Trip.findOne({})
    .then(function(trip){var id = trip.days[req.params.dayIdx]; return Day.findOne({_id: id}).exec(); })
    .then(function(day){day.hotel = null; return day.save();})
    .then(function(day){
      return Day.populate(day,[{path:'hotel',model:'Hotel'},{path: 'restaurants',model:'Restaurant'},{path: 'activities',model:'Activity'}]);
    })
    .then(function(fullDay){res.json(fullDay);});
});

// remove a given restaurant from a given day
router.get('/remove/restaurants/:dayIdx/:restaurantID',function(req,res){
  Trip.findOne({})
    .then(function(trip){var id = trip.days[req.params.dayIdx]; return Day.findOne({_id: id}).exec(); })
    .then(function(day){var idx = day.restaurants.indexOf(req.params.restaurantID); day.restaurants.splice(idx,1); return day.save();})
    .then(function(day){
      return Day.populate(day,[{path:'hotel',model:'Hotel'},{path: 'restaurants',model:'Restaurant'},{path: 'activities',model:'Activity'}]);
    })
    .then(function(fullDay){res.json(fullDay);});
});

// remove a given activity from a given day
router.get('/remove/activities/:dayIdx/:activityID',function(req,res){
  Trip.findOne({})
    .then(function(trip){var id = trip.days[req.params.dayIdx]; return Day.findOne({_id: id}).exec(); })
    .then(function(day){var idx = day.activities.indexOf(req.params.activityID); day.activities.splice(idx,1); return day.save();})
    .then(function(day){
      return Day.populate(day,[{path:'hotel',model:'Hotel'},{path: 'restaurants',model:'Restaurant'},{path: 'activities',model:'Activity'}]);
    })
    .then(function(fullDay){res.json(fullDay);});
});

// make a new empty trip
router.get('/newtrip',function(req,res){
  var trip = new Trip ();
  trip.save(function(err,newTrip){
    if (err) {console.log(err);}
    else {res.json(newTrip);}
  });
});



module.exports = router;
