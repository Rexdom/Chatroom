var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var HistorySchema = new Schema(
  {
    message: {type: String, required: true, max: 300},
    user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    time: {type: Date, default: Date.now, required: true},
  }
);


module.exports = mongoose.model('History', HistorySchema);