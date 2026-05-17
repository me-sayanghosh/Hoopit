import Folder from '../models/folder.model.js';
import urlSchema from '../models/shorturl.model.js';
import { AppError } from '../utils/httpError.js';

const normalizeShortUrlIds = (value) => {
    if (!Array.isArray(value)) return [];

    return [...new Set(value.map((item) => String(item)).filter(Boolean))];
};

const ensureOwnedShortUrls = async (shortUrlIds, ownerId) => {
    if (!shortUrlIds.length) return [];

    const urls = await urlSchema.find({ _id: { $in: shortUrlIds }, user: ownerId }).select('_id shortUrl');
    if (urls.length !== shortUrlIds.length) {
        throw new AppError('One or more selected links do not belong to you.', 403);
    }

    return urls;
};

const mapFolder = (folder) => ({
    id: folder._id,
    name: folder.name,
    description: folder.description,
    owner: folder.owner,
    shortUrls: (folder.shortUrls || []).map((item) => ({
        id: item._id,
        shortUrl: item.shortUrl,
        originalUrl: item.originalUrl,
        folder: item.folder || '',
    })),
    shortUrlIds: (folder.shortUrls || []).map((item) => item._id),
    createdAt: folder.createdAt,
    updatedAt: folder.updatedAt,
});

export const listFoldersByOwner = async (ownerId) => {
    try {
        const folders = await Folder.find({ owner: ownerId })
            .populate({ path: 'shortUrls', select: '_id shortUrl originalUrl folder' })
            .sort({ updatedAt: -1, createdAt: -1 });

        return folders.map(mapFolder);
    } catch (err) {
        throw new AppError(err.message || 'Failed to list folders.', 500);
    }
};

export const createFolder = async ({ name, description = '', shortUrlIds = [], ownerId }) => {
    try {
        const trimmedName = String(name || '').trim();
        if (!trimmedName) {
            throw new AppError('Folder name is required.', 400);
        }

        const ids = normalizeShortUrlIds(shortUrlIds);
        await ensureOwnedShortUrls(ids, ownerId);

        const existing = await Folder.findOne({ owner: ownerId, name: trimmedName });
        if (existing) {
            throw new AppError('A folder with this name already exists.', 409);
        }

        const folder = await Folder.create({
            name: trimmedName,
            description: String(description || '').trim(),
            owner: ownerId,
            shortUrls: ids,
        });

        if (ids.length) {
            await urlSchema.updateMany(
                { _id: { $in: ids }, user: ownerId },
                { $set: { folder: trimmedName } }
            );
        }

        const created = await Folder.findById(folder._id).populate({ path: 'shortUrls', select: '_id shortUrl originalUrl folder' });
        return mapFolder(created);
    } catch (err) {
        if (err instanceof AppError) throw err;
        throw new AppError(err.message || 'Failed to create folder.', 500);
    }
};

export const updateFolder = async (folderId, { name, description = '', shortUrlIds = [] }, ownerId) => {
    try {
        const folder = await Folder.findOne({ _id: folderId, owner: ownerId }).populate({ path: 'shortUrls', select: '_id shortUrl originalUrl folder' });
        if (!folder) {
            throw new AppError('Folder not found.', 404);
        }

        const trimmedName = String(name || '').trim();
        if (!trimmedName) {
            throw new AppError('Folder name is required.', 400);
        }

        const ids = normalizeShortUrlIds(shortUrlIds);
        await ensureOwnedShortUrls(ids, ownerId);

        const conflict = await Folder.findOne({ owner: ownerId, name: trimmedName, _id: { $ne: folderId } });
        if (conflict) {
            throw new AppError('A folder with this name already exists.', 409);
        }

        const previousIds = (folder.shortUrls || []).map((item) => String(item._id));
        const previousName = folder.name;

        await folder.updateOne({
            $set: {
                name: trimmedName,
                description: String(description || '').trim(),
                shortUrls: ids,
            },
        });

        const addedIds = ids.filter((item) => !previousIds.includes(item));
        const removedIds = previousIds.filter((item) => !ids.includes(item));

        if (addedIds.length) {
            await urlSchema.updateMany(
                { _id: { $in: addedIds }, user: ownerId },
                { $set: { folder: trimmedName } }
            );
        }

        if (removedIds.length) {
            await urlSchema.updateMany(
                { _id: { $in: removedIds }, user: ownerId, folder: previousName },
                { $set: { folder: '' } }
            );
        }

        if (previousName !== trimmedName) {
            await urlSchema.updateMany(
                { user: ownerId, folder: previousName },
                { $set: { folder: trimmedName } }
            );
        }

        const updated = await Folder.findById(folderId).populate({ path: 'shortUrls', select: '_id shortUrl originalUrl folder' });
        return mapFolder(updated);
    } catch (err) {
        if (err instanceof AppError) throw err;
        throw new AppError(err.message || 'Failed to update folder.', 500);
    }
};