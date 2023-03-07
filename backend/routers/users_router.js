import { Router } from "express";
import { User } from "../models/user.js";
import multer from "multer";
import bcrypt from "bcrypt";
import path from "path";
import { isAuthenticated } from "../middleware/auth.js";

export const usersRouter = Router();
const upload = multer({ dest: "uploads/" });

// get users pangiated without passwordHash
usersRouter.get("/", isAuthenticated, async (req, res) => {
  const { page, limit } = req.query;
  const users = await User.findAndCountAll({
    offset: (page - 1) * limit,
    limit: parseInt(limit),
    attributes: { exclude: ["passwordHash"] },
  });
  return res.json(users);
});

// signup
usersRouter.post("/signup", upload.single("avatar"), async (req, res) => {
  const { username, password } = req.body;
  const avatar = req.file;
  const user = User.build({
    username,
    avatar,
  });
  const saltRounds = 10;
  const salt = bcrypt.genSaltSync(saltRounds);
  const hashedPassword = bcrypt.hashSync(password, salt);
  user.passwordHash = hashedPassword;
  try {
    await user.save();
  } catch (error) {
    return res.status(422).json({
      error: "Username already exists. Please choose a different one.",
    });
  }
  return res.json(user);
});

// signin
usersRouter.post("/signin", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ where: { username } });
  if (!user) {
    return res
      .status(404)
      .json({ error: "No user with specified username exists." });
  }
  const passwordCorrect = bcrypt.compareSync(password, user.passwordHash);
  // incorrect password
  if (!passwordCorrect) {
    return res.status(401).json({ error: "Password incorrect." });
  }
  req.session.user = user;

  return res.json(user);
});

// signout
usersRouter.post("/signout", isAuthenticated, async (req, res) => {
  req.session.destroy();
  return res.json({ message: "Signed out." });
});

// get avatar image
usersRouter.get("/:UserId/avatar", isAuthenticated, async (req, res) => {
  let { UserId } = req.params;
  const user = await User.findByPk(UserId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  if (!user.avatar) {
    res.setHeader("Content-Type", "image/png");
    return res.sendFile("static/media/avatar.png", { root: path.resolve() });
  }
  res.setHeader("Content-Type", user.avatar.mimetype);
  res.sendFile(user.avatar.path, { root: path.resolve() });
});

// returns the currently logged in user
usersRouter.get("/me", async (req, res) => {
  const user = req.session.user;
  if (!user) {
    return res.status(401).json({ error: "Not logged in." });
  }
  return res.json(user);
});
