import mongoose from "mongoose";
import { JOB_TYPES, SKILL_LEVELS } from "./enums.js";

const { Schema, model } = mongoose;

const JobSchema = new Schema(
  {
    employerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: String,

    type: {
      type: String,
      enum: Object.values(JOB_TYPES),
    },

    requirements: {
      skills: [
        {
          name: String,
          requiredLevel: {
            type: Number,
            enum: Object.values(SKILL_LEVELS),
          },
        },
      ],
    },
  },
  { timestamps: true }
);

export const Job = model("Job", JobSchema);
