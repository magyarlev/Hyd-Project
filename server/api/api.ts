import express, { Request, Response } from "express";
import mongoose from "mongoose";
import Story from "../modules/story";

const router = express.Router();
const db = "mongodb://localhost:27017/eventdb";

mongoose
  .connect(db)
  .then(() => {
    console.log("Connected to mongodb");
  })
  .catch((error) => {
    console.error(error);
  });

// USER API

// STORY API

router.get("/story", async (req: Request, res: Response) => {
  try {
    let stories = await Story.find({});
    res.status(200).json(stories);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error.");
  }
});

router.get("/story/random", async (req: Request, res: Response) => {
  try {
    let story = await Story.find({});

    res.status(200).json(story[Math.floor(Math.random() * story.length - 1)]);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error.");
  }
});

router.post("/story", async (req: Request, res: Response) => {
  try {
    const newStory = new Story({
      email: req.body.email,
      type: req.body.type,
      content: req.body.story,
    });
    const registeredStory = await newStory.save();
    res.status(200).json(registeredStory);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error.");
  }
});

router.put("/story", async (req: Request, res: Response) => {
  try {
    const story = req.body;
    const updatedStory = await Story.findByIdAndUpdate(story.id, story);
    if (updatedStory) {
      res.status(200).send("Story updated successfully");
    } else {
      res.status(500).send("Story not found");
    }
  } catch (error) {
    res.status(500).send("Internal server error");
  }
});

router.delete("/story", async (req: Request, res: Response) => {
  const storyId = req.params.id;
  try {
    const deletedStory = await Story.findByIdAndDelete(storyId);
    if (deletedStory) {
      res.status(200).send("Story deleted successfully");
    } else {
      res.status(404).send("Story not found");
    }
  } catch (error) {
    res.status(500).send("Internal server error");
  }
});

export default router;
