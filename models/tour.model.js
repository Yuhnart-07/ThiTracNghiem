const mongoose = require('mongoose');


module.exports.Tour = mongoose.model(
  'Tour', 
  { 
    name: String,
    time: String, 
    vehicle: String
  },
  "tours" // TÊN COLLECTION
);