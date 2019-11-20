var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var GameSchema = new Schema(
  {
    url: {type: String, required: true},
    id: {type: String, required: true},
    name: {type: String, required: true},
  }
);


module.exports = mongoose.model('Game', GameSchema);