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
        required: true,
        minlength: 8,
        match: [/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/, 'Password must be at least 8 characters and include uppercase, lowercase, number and special character'],
    },
    avater: {
        type: String,
        required : false,
        default :function() {
            return getGravatarUrl(this.email);
        }
    },

});


function getGravatarUrl(email) {
    const hash = crypto.createHash('md5').update(email.trim().toLowerCase()).digest('hex');
    return `https://www.gravatar.com/avatar/${hash}?d=identicon`;
}

const User = mongoose.model('User', userSchema);

export default User;

