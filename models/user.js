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

const SALT_WORK_FACTOR = 10;

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
            console.log(password + ' ' + user.password);
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
            if(user.balance == null) {
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



    if (!user.isModified('password')) return next();
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);

        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);

            user.password = hash;
            next();
        });
    });
});

var User = mongoose.model('user', UserSchema);
module.exports = User;