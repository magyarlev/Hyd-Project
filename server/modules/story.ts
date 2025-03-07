import mongoose from "mongoose";

const Schema = mongoose.Schema;
const storySchema = new Schema({
  id: String,
  email: String,
  type: String,
  content: String,
});

export default mongoose.model("story", storySchema, "stories");
