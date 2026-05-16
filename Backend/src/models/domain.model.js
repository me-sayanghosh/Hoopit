import mongoose from 'mongoose';

const domainSchema = new mongoose.Schema({
    domain: { type: String, required: true, unique: true, index: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    createdAt: { type: Date, default: Date.now },
    verified: { type: Boolean, default: false },
    verificationToken: { type: String, default: '' }
});

const Domain = mongoose.model('Domain', domainSchema);
export default Domain;
