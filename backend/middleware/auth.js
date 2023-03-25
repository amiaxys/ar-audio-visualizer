import session from "express-session";

export const isAuthenticated = function (req, res, next) {
  req.user = req.session.user;
  console.log(req.headers.host, process.env.AR_FRONTEND_URL);
  if (!req.session.user)
    return res.status(401).json({ error: "Not Authenticated" });
  next();
};

export const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || "secret",
  resave: false,
  saveUninitialized: true,
});
