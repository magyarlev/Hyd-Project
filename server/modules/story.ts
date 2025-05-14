import mongoose, { Mongoose } from "mongoose";

const Schema = mongoose.Schema;
const storySchema = new Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  type: String,
  content: String,
});

export default mongoose.model("story", storySchema, "stories");
