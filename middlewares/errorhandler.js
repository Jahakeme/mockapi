const error = (error, req, res, next) => {
    const status = error.status || 500;
    const message = error.message || "Internal server error";
    return res.status(status).json({
        success: false,
        status,
        message
    });
};

module.exports = error;