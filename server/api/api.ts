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
  token?: string;
  userId?: string;
}

mongoose
  .connect(db)
  .then(() => {
    console.log("Connected to mongodb");
  })
  .catch((error) => {
    console.error(error);
  });

export const extractToken = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).send("Unauthorized request");
    throw new Error();
  }
  let token = authHeader.split(" ")[1];
  if (token === "null") {
    res.status(401).send("Unauthorized request");
    throw new Error();
  }
  req.token = token;
  next();
};

export const verifyToken = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const secretKey = process.env.JWT_SECRET;
  const token = (req as any).token;
  if (secretKey) {
    let payload = jwt.verify(token, secretKey);
    if (!payload) {
      res.status(401).send("Unauthorized request");
      throw new Error();
    }
    next();
  } else {
    throw new Error("Invalid token.");
  }
};

export const attachUserId = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const decoded = jwt.decode((req as any).token) as JwtPayload;
    (req as any).userId = decoded.subject;
    next();
  } catch (error) {
    res.status(401).send("Invalid or malformed token");
    throw new Error();
  }
};

router.get("/", (req: Request, res: Response) => {
  res.send("From API Route");
});

// USER API

router.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.find({ email });
    if (existingUser.length > 0) {
      res.status(401).send("User already exists");
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    let user = new User({ email, password: hashedPassword, role: "user" });
    let savedUser = await user.save();
    let payload = {
      subject: savedUser._id,
      role: savedUser.role,
    };
    const secretKey = process.env.JWT_SECRET;
    if (secretKey) {
      let token = jwt.sign(payload, secretKey, { expiresIn: "24h" });
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
      let payload = {
        subject: foundUser._id,
        role: foundUser.role,
        exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour expiration
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

router.get(
  "/story",
  extractToken,
  verifyToken,
  attachUserId,
  async (req: CustomRequest, res: Response) => {
    const user = await User.findById(req.userId);
    if (!user) {
      res.status(401).send("Unauthorized request");
      throw new Error();
    } else if (user.role !== "admin") {
      try {
        const stories = await Story.find({ author: user });
        res.status(200).json(stories);
      } catch (error) {
        res.status(500).send("Internal server error.");
        throw new Error("Story not found.");
      }
    } else if (user.role === "admin") {
      try {
        let stories = await Story.find({});
        res.status(200).json(stories);
      } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error.");
      }
    }
  }
);

router.get(
  "/story/random",
  extractToken,
  verifyToken,
  async (req: Request, res: Response) => {
    const type = req.query.type;

    try {
      let stories = await Story.find({ type });
      const result = stories[Math.floor(Math.random() * stories.length)];
      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal server error.");
    }
  }
);

router.post(
  "/story",
  extractToken,
  verifyToken,
  attachUserId,
  async (req: CustomRequest, res: Response) => {
    try {
      const user = await User.findById(req.userId);
      const newStory = new Story({
        author: user,
        type: req.body.type,
        content: req.body.content,
      });
      const registeredStory = await newStory.save();
      res.status(200).json(registeredStory);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal server error.");
    }
  }
);

router.put(
  "/story",
  extractToken,
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const story = req.body;
      const updatedStory = await Story.findByIdAndUpdate(story._id, story);
      if (updatedStory) {
        res.status(200).json(updatedStory);
      } else {
        res.status(500).send("Story not found");
      }
    } catch (error) {
      res.status(500).send("Internal server error");
    }
  }
);

router.delete(
  "/story/:id",
  extractToken,
  verifyToken,
  async (req: Request, res: Response) => {
    const storyId = req.params.id;
    try {
      const deletedStory = await Story.findByIdAndDelete(storyId);
      if (deletedStory) {
        res.status(200).json("Story deleted successfully");
      } else {
        res.status(404).send("Story not found");
      }
    } catch (error) {
      res.status(500).send("Internal server error");
    }
  }
);

export default router;
