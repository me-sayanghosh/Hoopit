import mongoose from 'mongoose';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Invalid email address'],
    },
    password: {
        type: String,
        required: function() {
            return this.authProvider === 'local';
        },
        minlength: 8,
        match: [/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/, 'Password must be at least 8 characters and include uppercase, lowercase, number and special character'],
    },
    googleId: {
        type: String,
        required: false,
        unique: true,
        sparse: true,
    },
    authProvider: {
        type: String,
        enum: ['local', 'google'],
        default: 'local',
    },
    avater: {
        type: String,
        required : false,
        default :function() {
            return getGravatarUrl(this.email);
        }
    },
    passwordResetCodeHash: {
        type: String,
        required: false,
    },
    passwordResetCodeExpires: {
        type: Date,
        required: false,
    },
    passwordResetVerified: {
        type: Boolean,
        default: false,
    },

});


function getGravatarUrl(email) {
    const hash = crypto.createHash('md5').update(email.trim().toLowerCase()).digest('hex');
    return `https://www.gravatar.com/avatar/${hash}?d=identicon`;
}

const User = mongoose.model('User', userSchema);

export default User;

