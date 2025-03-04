import express, { Request, Response } from "express";
import cors from "cors";
import mongoose from "mongoose";
import Story from "./modules/story";

const app = express();
const port = 3000;
const db = "mongodb://localhost:27017/munkaügyek";

const corsOptions = {
  origin: "http://localhost:4200",
  optionsSuccessStatus: 204,
  methods: "GET, POST, PUT, DELETE",
};

mongoose
  .connect(db)
  .then(() => {
    console.log("Connected to mongodb");
  })
  .catch((error) => {
    console.error(error);
  });

app.use(cors(corsOptions));
app.use(express.json());

app.get("/story", async (req: Request, res: Response) => {
  try {
    let stories = await Story.find({});
    res.status(200).json(stories);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error.");
  }
});

app.get("/story/random", async (req: Request, res: Response) => {
  try {
    let story = await Story.find({});

    res.status(200).json(story[Math.floor(Math.random() * story.length - 1)]);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error.");
  }
});

app.post("/story", async (req: Request, res: Response) => {
  try {
    const newStory = new Story({
      id: req.body.id,
      email: req.body.email,
      type: req.body.type,
      story: req.body.story,
    });
    const registeredItem = await newStory.save();
    res.status(200).json(registeredItem);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error.");
  }
});

app.put("/story", async (req: Request, res: Response) => {
  try {
    const story = req.body;
    const updatedStory = await Story.findByIdAndUpdate(story._id, story);
    if (updatedStory) {
      res.status(200).send("Story updated successfully");
    } else {
      res.status(500).send("Story not found");
    }
  } catch (error) {
    res.status(500).send("Internal server error");
  }
});

app.delete("/story", async (req: Request, res: Response) => {
  try {
    const storyId = req.body._id;
    await Story.findByIdAndDelete(storyId);
    res.status(200).send("Story deleted successfully");
  } catch (error) {
    res.status(500).send("Internal server error");
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
