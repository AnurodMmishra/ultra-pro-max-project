/**
 * Wraps async route handlers so rejected Promise always becomes next(err).
 * Avoids Express 5 / router edge cases where async errors surface as odd TypeErrors.
 */
function asyncHandler(fn) {
    return function wrapped(req, res, next) {
        if (typeof next !== "function") {
            console.error("asyncHandler: next is not a function");
            if (!res.headersSent) {
                res.status(500).json({ message: "Internal server error" });
            }
            return;
        }
        Promise.resolve(fn(req, res)).catch(next);
    };
}

module.exports = asyncHandler;
