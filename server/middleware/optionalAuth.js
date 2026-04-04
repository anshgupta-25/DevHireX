const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Optional auth: attaches req.user if valid token exists, but doesn't block if missing
const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
    }
  } catch {
    // Token invalid or expired — just continue without user
  }
  next();
};

module.exports = { optionalAuth };
