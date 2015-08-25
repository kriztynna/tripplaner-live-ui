var mongoose = require('mongoose');

var DaySchema = new mongoose.Schema({
  hotel: {type: mongoose.Schema.Types.ObjectId, ref: 'Hotel'},
  restaurants: {type: [String]},
  activities: {type: [String]}
});

module.exports = mongoose.model('Day', DaySchema);