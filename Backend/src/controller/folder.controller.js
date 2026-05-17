import wrapasync from '../utils/errorHandeler.js';
import { createFolder, listFoldersByOwner, updateFolder } from '../dao/folder.js';
import { AppError } from '../utils/httpError.js';

export const getFolders = wrapasync(async (req, res) => {
    const ownerId = req.user?._id;
    const folders = await listFoldersByOwner(ownerId);
    res.status(200).json({ folders });
});

export const postFolder = wrapasync(async (req, res) => {
    const { name, description, shortUrlIds } = req.body || {};
    if (!name || typeof name !== 'string') {
        throw new AppError('Folder name is required.', 400);
    }

    const created = await createFolder({
        name,
        description,
        shortUrlIds,
        ownerId: req.user?._id,
    });

    res.status(201).json({ folder: created });
});

export const putFolder = wrapasync(async (req, res) => {
    const { id } = req.params;
    const { name, description, shortUrlIds } = req.body || {};

    const updated = await updateFolder(id, {
        name,
        description,
        shortUrlIds,
    }, req.user?._id);

    res.status(200).json({ folder: updated });
});