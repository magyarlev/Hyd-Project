import mongoose from "mongoose";

const Schema = mongoose.Schema;
const storySchema = new Schema({
  id: Number,
  email: String,
  type: String,
  story: String,
});

export default mongoose.model("story", storySchema, "stories");
