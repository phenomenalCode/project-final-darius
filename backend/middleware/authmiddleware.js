import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.warn("[Auth] No Authorization header");
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      console.warn("[Auth] No token after Bearer");
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "supersecret123");

    if (!decoded) {
      console.warn("[Auth] Token could not be decoded");
      return res.status(401).json({ error: "Invalid token" });
    }

    // Ensure req.user has id and groupId
    req.user = {
      id: decoded.id,
      groupId: decoded.groupId,
    };

   
    next();
  } catch (err) {
    console.error("[Auth] Error verifying token:", err.message);
    res.status(401).json({ error: "Unauthorized" });
  }
};
