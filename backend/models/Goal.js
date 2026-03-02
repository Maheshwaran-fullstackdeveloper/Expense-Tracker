import mongoose from "mongoose";

const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    title: {
      type: String,
      required: [true, "Please add a goal title"],
      trim: true,
      maxlength: [50, "Goal title cannot be more than 50 characters"],
    },
    targetAmount: {
      type: Number,
      required: [true, "Please add a target amount"],
    },
    description: {
      type: String,
      maxlength: [200, "Description cannot be more than 200 characters"],
    },
    imageUrl: {
      type: String,
      default: "default-product.jpg",
    },
    deadline: {
      type: Date,
      required: [true, "Please add a deadline"],
    },
    savedAmount: {
      type: Number,
      default: 0,
    },
    monthlySavingsAmount: {
      type: Number,
      default: 0,
    },
    lastContributionMonth: {
      type: String, // e.g. "2026-03"
    },
    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
    },
  },
  {
    timestamps: true,
  },
);

const Goal = mongoose.model("Goal", goalSchema);
export default Goal;
