import mongoose from "mongoose";

const Schema = mongoose.Schema;
const userSchema = new Schema({
  email: String,
  password: String,
  role: String,
  emailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: {
    type: String,
    default: null,
    required: false,
  },
  emailVerificationTokenExpires: {
    type: Date,
    default: null,
    required: false,
  },
});

export default mongoose.model("user", userSchema, "users");
