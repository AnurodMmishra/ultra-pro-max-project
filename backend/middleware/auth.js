const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    if (typeof next !== "function") {
        console.error("authMiddleware: next is not a function");
        return res.status(500).json({ message: "Internal server error" });
    }
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            console.error("JWT_SECRET environment variable is not set");
            return res.status(500).json({ message: "Server configuration error" });
        }

        const decoded = jwt.verify(token, jwtSecret);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
};

module.exports = authMiddleware;
