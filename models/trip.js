var mongoose = require('mongoose');
//var DaySchema = require('./Day').schema;

var TripSchema = new mongoose.Schema({
  days: {type: Array}
});

module.exports = mongoose.model('Trip', TripSchema);