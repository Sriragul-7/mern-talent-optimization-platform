import mongoose from "mongoose";

const TokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

TokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Token = mongoose.model("Token", TokenSchema);
