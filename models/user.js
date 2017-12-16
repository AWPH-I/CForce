var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

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
    required: true
  }, balance: {
    type: Number,
    default: 0
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

UserSchema.statics.validateId = function(id, callback) {
    User.findOne({ _id: id }).exec(function (err, user) {
        if (err) {
            return callback(err);
        } else if (!user) {
            var err = new Error('User not found.');
            err.status = 401;
            return callback(err);
        } else {
            return callback(null, user);
        }
    });
}

UserSchema.statics.getBalance = function(id, callback) {
    User.findOne({ _id: id }).exec(function (err, user) {
        if (err) {
            return callback(err);
        } else if (!user) {
            var err = new Error('User not found.');
            err.status = 401;
            return callback(err);
        } else {
            if(!user.balance) {
                user.balance = 0;
                user.save(function (err, updatedUser) {
                    if (err) return callback(err);
                    return callback(null, updatedUser.balance);
                });
            } else {
                return callback(null, user.balance);
            }
        }
    });
}

UserSchema.pre('save', function(next) {
    var user = this;
    //Hash the password
    bcrypt.hash(user.password, 10, function(err, hash) {
        if (err) {
          return next(err);
        }
        user.password = hash;
        next();
    })
});

var User = mongoose.model('user', UserSchema);
module.exports = User;