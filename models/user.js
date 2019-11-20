var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UserSchema = new Schema(
  {
    account: {type: String, required: true, max: 100},
    password: {type: String, required: true, max: 100},
    user_name: {type: String, required: true, max: 100},
    streams: [{type:String, max:100}],
  }
);

UserSchema
.virtual('url')
.get(function () {
  return '/user/' + this._id;
});

module.exports = mongoose.model('User', UserSchema);