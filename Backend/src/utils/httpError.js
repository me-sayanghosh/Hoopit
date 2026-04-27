export class AppError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.status = statusCode >= 500 ? 'error' : 'fail';
        this.isOperational = true;

        Error.captureStackTrace?.(this, this.constructor);
    }
}

export const asyncHandler = (handler) => {
    return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
};

export const notFoundHandler = (req, res, next) => {
    next(new AppError(`Route not found: ${req.originalUrl}`, 404));
};

export const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const status = err.status || (statusCode >= 500 ? 'error' : 'fail');

    res.status(statusCode).json({
        status,
        message: err.message || 'Internal Server Error'
    });
};