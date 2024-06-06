import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config({
  path: "../.env",
});

export default function Auth(req, res, next) {
  try {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
      return res.status(403).json({ error: "No token provided" });
    }

    const token = authorizationHeader.split(" ")[1];
    if (!token) {
      return res.status(403).json({ error: "Malformed token" });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decodedToken;

    next();
  } catch (error) {
    console.error("Authentication error:", error.message); // Log the error for debugging
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: "Token expired" });
    }
    res.status(401).json({ error: "Authentication failed" });
  }
}

export function localVariables(req, res, next) {
  req.app.locals = {
    OTP: null,
    resetSession: false,
  };
  next();
}
