import mongoose from "mongoose";
import { SKILL_LEVELS, SKILL_LEVEL_LABELS } from "./enums.js";

const { Schema, model } = mongoose;

const SkillSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    domainId: { type: Schema.Types.ObjectId, ref: "Domain", required: true },

    name: { type: String, required: true },

    currentLevel: {
      type: Number,
      enum: Object.values(SKILL_LEVELS),
      required: true,
    },

    calculatedScore: {
      finalScore: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

SkillSchema.virtual("levelLabel").get(function () {
  return SKILL_LEVEL_LABELS[this.currentLevel];
});

export const Skill = model("Skill", SkillSchema);
