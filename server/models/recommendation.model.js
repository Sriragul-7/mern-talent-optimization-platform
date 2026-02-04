import mongoose from "mongoose";
import { RECOMMENDATION_TYPES } from "./enums.js";

const { Schema, model } = mongoose;

const RecommendationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },

    type: {
      type: String,
      enum: Object.values(RECOMMENDATION_TYPES),
    },

    title: String,
    description: String,
  },
  { timestamps: true }
);

export const Recommendation = model("Recommendation", RecommendationSchema);
