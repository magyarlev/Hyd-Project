import express, { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import mongoose from "mongoose";
import Story from "../modules/story";
import User from "../modules/users";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

dotenv.config();

const router = express.Router();
const db = "mongodb://localhost:27017/how-is-your-day";
export interface CustomRequest extends Request {
  userId: string | JwtPayload;
}

mongoose
  .connect(db)
  .then(() => {
    console.log("Connected to mongodb");
  })
  .catch((error) => {
    console.error(error);
  });

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.headers.authorization) {
    res.status(401).send("Unauthorized request");
    throw new Error();
  }
  let token = req.headers.authorization.split(" ")[1];
  if (token === "null") {
    res.status(401).send("Unauthorized request");
    throw new Error();
  }

  const secretKey = process.env.JWT_SECRET;
  if (secretKey) {
    let payload = jwt.verify(token, secretKey);
    if (!payload) {
      res.status(401).send("Unauthorized request");
      throw new Error();
    }
    (req as CustomRequest).userId = payload as string;
    next();
  } else {
    throw new Error("JWT key error.");
  }
};

router.get("/", (req: Request, res: Response) => {
  res.send("From API Route");
});

// USER API

router.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    let user = new User({ email, password: hashedPassword });
    let savedUser = await user.save();
    let payload = {
      subject: savedUser._id,
    };
    const secretKey = process.env.JWT_SECRET;
    if (secretKey) {
      let token = jwt.sign(payload, secretKey);
      res.status(200).send({ token });
    } else {
      throw new Error("JWT key error.");
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).send("Something went wrong, please try again later.");
  }
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const foundUser = await User.findOne({ email });
    if (!foundUser) {
      res.status(401).send("Invalid email");
    } else if (foundUser.password) {
      const passwordMatch = await bcrypt.compare(password, foundUser.password);
      if (!passwordMatch) {
        res.status(401).send("Invalid password");
      }
    } else {
      let payload = {
        subject: foundUser._id,
      };
      const secretKey = process.env.JWT_SECRET;
      if (secretKey) {
        let token = jwt.sign(payload, secretKey);
        res.status(200).send({ token });
      } else {
        throw new Error("JWT key error.");
      }
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).send("Something went wrong, please try again later.");
  }
});

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
      content: req.body.content,
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
