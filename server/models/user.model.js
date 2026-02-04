import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { ROLES, VISIBILITY_SETTINGS } from "./enums.js";

const { Schema, model } = mongoose;

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },

    personalInfo: {
      firstName: String,
      lastName: String,
      bio: String,
    },

    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.USER,
    },

    settings: {
      profileVisibility: {
        type: String,
        enum: Object.values(VISIBILITY_SETTINGS),
        default: VISIBILITY_SETTINGS.EMPLOYERS_ONLY,
      },
    },
  },
  { timestamps: true }
);

// Hash password
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.comparePassword = function (pwd) {
  return bcrypt.compare(pwd, this.password);
};

export const User = model("User", UserSchema);
