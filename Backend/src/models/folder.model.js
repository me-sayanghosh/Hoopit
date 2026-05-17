import mongoose from 'mongoose';

const folderSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        default: '',
        trim: true,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    shortUrls: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'shortUrl',
    }],
}, {
    timestamps: true,
});

folderSchema.index({ owner: 1, name: 1 }, { unique: true });

const Folder = mongoose.model('Folder', folderSchema);

export default Folder;