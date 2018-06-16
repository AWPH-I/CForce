const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
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

UserSchema.statics.authenticate = async (email, password) => {
    const user = await User.findOne({email: email}).exec();

    if(user) {
        if(await bcrypt.compare(password, user.password)) {
            return user;
        } else {
            return false;
        }
    } else {
        return false;
    }
};


UserSchema.pre('save', function(next) {
    const user = this;

    if (user.isModified('password')) {
        bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
            if (err) return next(err);

            bcrypt.hash(user.password, salt, (err, hash) => {
                if (err) return next(err);

                user.password = hash;
                next();
            });
        });
    } else {
        next();
    }
});

const User = mongoose.model('user', UserSchema);

module.exports = User;