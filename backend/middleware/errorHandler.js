function errorHandler(err, req, res, next) {
    if (res.headersSent) {
        return next(err);
    }

    console.error(err);

    const statusCode = err.statusCode || 500;

    const message = process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message;

    res.status(statusCode).json({
        error: {
            message: message,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        }
    });
}

module.exports = errorHandler;