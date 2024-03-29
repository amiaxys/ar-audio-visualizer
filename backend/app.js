import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import session from "express-session";
import { usersRouter } from "./routers/users_router.js";
import { visualizationsRouter } from "./routers/visualizations_router.js";
import { sequelize } from "./datasource.js";
import { sessionMiddleware } from "./middleware/auth.js";

const PORT = 3000;
export const app = express();
app.use(bodyParser.json());

const whitelist = [
  "https://audiovisualizer.live",
  "https://www.audiovisualizer.live",
  "http://localhost:4200",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};
app.use(cors(corsOptions));

app.use(sessionMiddleware);

try {
  await sequelize.authenticate();
  // Automatically detect all of your defined models and create (or modify) the tables for you.
  // Prof says: This is a bad idea in production, but it's fine for development.
  await sequelize.sync({ alter: { drop: false } });
  console.log("Connection has been established successfully.");
} catch (error) {
  console.error("Unable to connect to the database:", error);
}

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

// Routers
app.use("/api/users", usersRouter);
app.use("/api/visualizations", visualizationsRouter);

app.listen(PORT, (err) => {
  if (err) console.log(err);
  else console.log("HTTP server on http://localhost:%s", PORT);
});
