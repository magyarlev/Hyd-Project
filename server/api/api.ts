import express, { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import mongoose from "mongoose";
import Story from "../modules/story";
import User from "../modules/users";
import bcrypt from "bcrypt";
import crypto from "crypto";
import {
  sendVerificationEmail,
  sendWelcomeEmail,
} from "../services/emailService";

const router = express.Router();
const db = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DBNAME || "how-is-your-day";

if (!db) {
  throw new Error(
    "MONGODB_URI is not set. On Render, set it as a Private env var, or upload a Secret File under /etc/secrets/.env containing MONGODB_URI=..."
  );
}
export interface CustomRequest extends Request {
  token?: string;
  userId?: string;
}

mongoose
  .connect(db, { dbName })
  .then(() => {
    console.log(`Connected to mongodb (dbName=${dbName})`);
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

    // Email verifikációs token generálása
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 óra

    let user = new User({
      email,
      password: hashedPassword,
      role: "user",
      emailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationTokenExpires: tokenExpires,
    });
    let savedUser = await user.save();

    // Verifikációs email küldése
    const verificationLink = `${
      process.env.CLIENT_URL || "http://localhost:4200"
    }/verify-email?token=${verificationToken}&userId=${savedUser._id}`;

    try {
      await sendVerificationEmail(email, verificationLink);
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Email küldés sikertelen, de a felhasználó regisztrálva van
      res.status(201).send({
        message:
          "User registered, but verification email could not be sent. Please try again later.",
        userId: savedUser._id,
      });
      return;
    }

    res.status(201).send({
      message:
        "User registered successfully. Please check your email to verify your account.",
      userId: savedUser._id,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).send("Something went wrong, please try again later.");
  }
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const foundUser = await User.findOne({ email });
    if (!foundUser) {
      res.status(401).send("Invalid email");
      return;
    }

    // Ellenőrizzük, hogy az email hitelesített-e
    if (!foundUser.emailVerified) {
      res.status(403).send("Please verify your email before logging in");
      return;
    }

    if (foundUser.password) {
      const passwordMatch = await bcrypt.compare(password, foundUser.password);
      if (!passwordMatch) {
        res.status(401).send("Invalid password");
        return;
      }
      let payload = {
        subject: foundUser._id,
        role: foundUser.role,
      };
      const secretKey = process.env.JWT_SECRET;
      if (secretKey) {
        let token = jwt.sign(payload, secretKey, { expiresIn: "24h" });
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
        type User = {
          email: string;
        };
        const stories = await Story.find()
          .populate<{ author: User }>("author", "email")
          .exec();
        const response = stories.map((story) => ({
          _id: story._id,
          type: story.type,
          content: story.content,
          email: story.author?.email || "N/A",
          status: story.status,
        }));
        res.status(200).json(response);
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
      let stories = await Story.find({ type, status: "approved" });

      if (!stories.length) {
        res.status(404).send("No approved stories found.");
      }
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
        status: "pending",
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

// EMAIL VERIFICATION API

router.post("/verify-email", async (req: Request, res: Response) => {
  try {
    const { token, userId } = req.body;

    if (!token || !userId) {
      res.status(400).send("Token and userId are required");
      return;
    }

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).send("User not found");
      return;
    }

    // Ellenőrizzük, hogy a token helyes és nem járt le
    if (user.emailVerificationToken !== token) {
      res.status(400).send("Invalid verification token");
      return;
    }

    if (
      user.emailVerificationTokenExpires &&
      new Date() > user.emailVerificationTokenExpires
    ) {
      res.status(400).send("Verification token has expired");
      return;
    }

    // Email hitelesítésének megjelölése
    user.emailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationTokenExpires = null;
    await user.save();

    // Üdvözlő email küldése
    try {
      if (user.email) {
        await sendWelcomeEmail(user.email, user.email.split("@")[0]);
      }
    } catch (emailError) {
      console.error("Welcome email sending failed:", emailError);
      // Az email küldés sikertelen, de a verifikáció sikerült
    }

    res.status(200).send({
      message: "Email verified successfully! You can now login.",
      userId: user._id,
    });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).send("Something went wrong during verification");
  }
});

// Újra elküldeni a verifikációs email-t
router.post(
  "/resend-verification-email",
  async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).send("Email is required");
        return;
      }

      const user = await User.findOne({ email });

      if (!user) {
        res.status(404).send("User not found");
        return;
      }

      if (user.emailVerified) {
        res.status(400).send("Email is already verified");
        return;
      }

      // Új token generálása
      const newVerificationToken = crypto.randomBytes(32).toString("hex");
      const newTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

      user.emailVerificationToken = newVerificationToken;
      user.emailVerificationTokenExpires = newTokenExpires;
      await user.save();

      // Email küldése
      const verificationLink = `${
        process.env.CLIENT_URL || "http://localhost:4200"
      }/verify-email?token=${newVerificationToken}&userId=${user._id}`;

      try {
        await sendVerificationEmail(email, verificationLink);
      } catch (emailError) {
        console.error("Error sending verification email:", emailError);
        res.status(500).send("Failed to send verification email");
        return;
      }

      res.status(200).send({
        message: "Verification email resent. Please check your email.",
        userId: user._id,
      });
    } catch (error) {
      console.error("Resend verification email error:", error);
      res.status(500).send("Something went wrong");
    }
  }
);

export default router;
