import mongoose from "mongoose";
import { APPLICATION_STATUS } from "./enums.js";

const { Schema, model } = mongoose;

const ApplicationSchema = new Schema(
  {
    jobId: { type: Schema.Types.ObjectId, ref: "Job" },
    userId: { type: Schema.Types.ObjectId, ref: "User" },

    status: {
      type: String,
      enum: Object.values(APPLICATION_STATUS),
      default: APPLICATION_STATUS.SUBMITTED,
    },
  },
  { timestamps: true }
);

export const Application = model("Application", ApplicationSchema);
