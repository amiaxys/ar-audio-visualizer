import session from "express-session";

export const isAuthenticated = function (req, res, next) {
  req.user = req.session.user;
  if (req.headers.origin == process.env.AR_FRONTEND_URL) {
    return next();
  }
  if (!req.session.user)
    return res.status(401).json({ error: "Not Authenticated" });
  next();
};

export const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || "secret",
  resave: false,
  saveUninitialized: true,
});
