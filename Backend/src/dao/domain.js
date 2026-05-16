import Domain from '../models/domain.model.js';
import { AppError } from '../utils/httpError.js';
import { randomUUID } from 'node:crypto';
import dns from 'node:dns/promises';

export const listDomains = async (userId = null) => {
    try {
        // return public domains (owner === null) plus domains owned by user
        const query = userId ? { $or: [{ owner: null }, { owner: userId }] } : { owner: null };
        const docs = await Domain.find(query).sort({ owner: 1, domain: 1 });
        return docs.map(d => ({ id: d._id, domain: d.domain, owner: d.owner, verified: d.verified }));
    } catch (err) {
        throw new AppError(err.message || 'Failed to list domains.', 500);
    }
};

export const createDomain = async (domainName, ownerId = null) => {
    try {
        const existing = await Domain.findOne({ domain: domainName });
        if (existing) {
            throw new AppError('Domain already exists', 409);
        }

        const token = randomUUID();
        const doc = new Domain({ domain: domainName, owner: ownerId || null, verified: false, verificationToken: token });
        await doc.save();
        return { id: doc._id, domain: doc.domain, owner: doc.owner, verified: doc.verified, verificationToken: token };
    } catch (err) {
        if (err instanceof AppError) throw err;
        throw new AppError(err.message || 'Failed to create domain.', 500);
    }
};

export const verifyDomain = async (domainId, ownerId = null) => {
    try {
        const doc = await Domain.findById(domainId);
        if (!doc) throw new AppError('Domain not found', 404);
        // only owner can verify (or public?)
        if (doc.owner && ownerId && String(doc.owner) !== String(ownerId)) {
            throw new AppError('Forbidden', 403);
        }

        // check TXT records for token
        const name = doc.domain;
        const token = doc.verificationToken || '';
        if (!token) throw new AppError('No verification token for domain', 400);

        let txts = [];
        try {
            txts = await dns.resolveTxt(name);
        } catch (e) {
            // DNS lookup failed
            throw new AppError('DNS lookup failed for domain', 400);
        }

        const flat = txts.flat().map(s => String(s));
        const expected = `hoopit=${token}`;
        const ok = flat.some(s => s.includes(expected));
        if (!ok) {
            return { verified: false };
        }

        doc.verified = true;
        await doc.save();
        return { verified: true };
    } catch (err) {
        if (err instanceof AppError) throw err;
        throw new AppError(err.message || 'Failed to verify domain', 500);
    }
}
