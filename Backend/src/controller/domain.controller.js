import wrapasync from '../utils/errorHandeler.js';
import { listDomains, createDomain } from '../dao/domain.js';
import { AppError } from '../utils/httpError.js';

import { verifyDomain as daoVerify } from '../dao/domain.js';

export const getDomains = wrapasync(async (req, res) => {
    const userId = req.user?._id || null;
    const domains = await listDomains(userId);
    res.status(200).json({ domains });
});

export const postDomain = wrapasync(async (req, res) => {
    const { domain } = req.body || {};
    if (!domain || typeof domain !== 'string') {
        throw new AppError('Domain is required', 400);
    }

    const ownerId = req.user?._id || null;
    const created = await createDomain(domain.trim(), ownerId);
    res.status(201).json({ domain: created });
});

export const verifyDomain = wrapasync(async (req, res) => {
    const { id } = req.params;
    const userId = req.user?._id || null;
    const result = await daoVerify(id, userId);
    res.status(200).json(result);
});
