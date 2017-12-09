var mongoose = require('mongoose');
var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
  },
  passwordConf: {
    type: String,
    required: true,
  }
});

UserSchema.statics.authenticate = function(email, password, callback) {
    User.findOne({ email: email }).exec(function (err, user) {
        //Catches err or non-existent user
        if (err) {
            return callback(err);
        } else if (!user) {
            var err = new Error('User not found.');
            err.status = 401;
            return callback(err);
        }

        bcrypt.compare(password, user.password, function(err, result) {
            if (result === true) {
                //This returns with no error and the found, validated user object
                return callback(null, user);
            } else {
                //Callback function is usually (error, user object)
                //This returns null in both and can therefore be used by the boolean of if(error || !user) to say email/password invalid
                return callback();
            }
        })
    });
}

UserSchema.pre('save', function(next) {
    var user = this;
    bcrypt.hash(user.password, 10, function(err, hash) {
        if (err) {
          return next(err);
        }
        user.password = hash;
        next();
    })
});

var User = mongoose.model('User', UserSchema);
module.exports = User;