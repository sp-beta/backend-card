import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Please Provide unique email"],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "password is required"],
    },
    googleId: String,
    hasFilledPersonalForm: {
      type: Boolean,
      default: false,
    },
    hasFilledBusinessForm: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);


export default mongoose.model("user",userSchema)