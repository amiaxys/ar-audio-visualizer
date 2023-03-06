import { Router } from "express";
import { Visualization } from "../models/visualization.js";
import multer from "multer";
import path from "path";
import { isAuthenticated } from "../middleware/auth.js";

const upload = multer({ dest: "uploads/" });

export const visualizationsRouter = Router();

// get visualizations paginated for specified user
visualizationsRouter.get("/users/:UserId/visualizations", isAuthenticated, async (req, res) => {
    const { page, limit } = req.query;
    const { UserId } = req.params;
    if (req.user.id !== parseInt(UserId)) {
        return res.status(403).json({ error: "Not authorized" });
    }
    const query = {where: { UserId }};
    if (page && limit) {
        query = {
            ...query,
            offset: (page - 1) * limit,
            limit: parseInt(limit),
        };
    }
    const visualizations = await Visualization.findAndCountAll(query);
    return res.json(visualizations);
    }
);

// post a new visualization
visualizationsRouter.post("/users/:UserId/visualizations", upload.single("audio"), isAuthenticated, async (req, res) => {
    const { title, metadata } = req.body;
    const { UserId } = req.params;
    if (req.user.id !== parseInt(UserId)) {
        return res.status(403).json({ error: "Not authorized" });
    }
    try {
        const visualization = await Visualization.create({
            title,
            audio: req.file,
            metadata: JSON.parse(metadata),
            UserId,
        });
        return res.json(visualization);
    } catch (error) {
        console.log(error);
        return res.status(422).json({ error: "Invalid data" });
    }
});

// get a visualization by id
visualizationsRouter.get("/users/:UserId/visualizations/:id", isAuthenticated, async (req, res) => {
    const { id, UserId } = req.params;
    if (req.user.id !== parseInt(UserId)) {
        return res.status(403).json({ error: "Not authorized" });
    }
    const visualization = await Visualization.findOne({where: {id, UserId}});
    if (!visualization) {
        return res.status(404).json({ error: "Visualization not found" });
    }
    return res.json(visualization);
});

// get audio for a visualization by id
visualizationsRouter.get("/users/:UserId/visualizations/:id/audio", isAuthenticated, async (req, res) => {
    const { id, UserId } = req.params;
    if (req.user.id !== parseInt(UserId)) {
        return res.status(403).json({ error: "Not authorized" });
    }
    const visualization = await Visualization.findOne({where: {id, UserId}});
    if (!visualization) {
        return res.status(404).json({ error: "Visualization not found" });
    }
    res.setHeader("Content-Type", visualization.audio.mimetype);
    res.sendFile(visualization.audio.path, { root: path.resolve() });
});

// update a visualization by id
visualizationsRouter.put("/users/:UserId/visualizations/:id", upload.single("audio"), isAuthenticated, async (req, res) => {
    const { id, UserId } = req.params;
    if (req.user.id !== parseInt(UserId)) {
        return res.status(403).json({ error: "Not authorized" });
    }
    const visualization = await Visualization.findOne({where: {id, UserId}});
    if (!visualization) {
        return res.status(404).json({ error: "Visualization not found" });
    }
    const { title, metadata } = req.body;
    try {
        visualization.title = title;
        visualization.metadata = JSON.parse(metadata);
        if (req.file) {
            visualization.audio = req.file;
        }
        await visualization.save();
        return res.json(visualization);
    } catch (error) {
        console.log(error);
        return res.status(422).json({ error: "Invalid data" });
    }
});

// delete a visualization by id
visualizationsRouter.delete("/users/:UserId/visualizations/:id", isAuthenticated, async (req, res) => {
    const { id, UserId } = req.params;
    if (req.user.id !== parseInt(UserId)) {
        return res.status(403).json({ error: "Not authorized" });
    }
    const visualization = await Visualization.findOne({where: {id, UserId}});
    if (!visualization) {
        return res.status(404).json({ error: "Visualization not found" });
    }
    await visualization.destroy();
    return res.json(visualization);
});
