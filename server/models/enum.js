// server/models/enums.js

export const ROLES = {
  USER: "user",
  EMPLOYER: "employer",
  ADMIN: "admin",
};

export const SKILL_LEVELS = {
  BEGINNER: 1,
  INTERMEDIATE: 2,
  ADVANCED: 3,
  EXPERT: 4,
};

export const SKILL_LEVEL_LABELS = {
  1: "Beginner",
  2: "Intermediate",
  3: "Advanced",
  4: "Expert",
};

export const APPLICATION_STATUS = {
  SUBMITTED: "submitted",
  VIEWED: "viewed",
  SHORTLISTED: "shortlisted",
  REJECTED: "rejected",
  HIRED: "hired",
};

export const JOB_TYPES = {
  FULL_TIME: "full-time",
  PART_TIME: "part-time",
  CONTRACT: "contract",
  INTERNSHIP: "internship",
  FREELANCE: "freelance",
};

export const RECOMMENDATION_TYPES = {
  SKILL: "skill",
  COURSE: "course",
  PROJECT: "project",
  RESOURCE: "resource",
};

export const VISIBILITY_SETTINGS = {
  PUBLIC: "public",
  PRIVATE: "private",
  EMPLOYERS_ONLY: "employers-only",
};
