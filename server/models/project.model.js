import mongoose from "mongoose";
const { Schema, model } = mongoose;

const ProjectSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    domainId: { type: Schema.Types.ObjectId, ref: "Domain" },

    title: { type: String, required: true },
    description: String,
    techStack: [String],
    githubLink: String,
  },
  { timestamps: true }
);

export const Project = model("Project", ProjectSchema);
