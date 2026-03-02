import Goal from "../models/Goal.js";
import Transaction from "../models/Transaction.js";
import fs from "fs";
import path from "path";
import { upload } from "../middleware/uploadMiddleware.js";

const uploadSingle = upload.single("image");

// @desc    Create new savings goal
// @route   POST /api/goals
// @access  Private
export const createGoal = async (req, res, next) => {
  uploadSingle(req, res, async (err) => {
    try {
      if (err) {
        res.status(400);
        throw new Error(err.message);
      }

      // Defensive check for req.body
      if (!req.body) {
        res.status(400);
        throw new Error("No data received in request body");
      }

      const {
        title,
        targetAmount,
        deadline,
        description,
        savedAmount,
        monthlySavingsAmount,
      } = req.body;

      if (!title || !targetAmount || !deadline) {
        res.status(400);
        throw new Error("Title, target amount, and deadline are required");
      }

      // Explicitly set status to active to prevent "auto-achieved" bug
      const goal = await Goal.create({
        user: req.user._id,
        title,
        targetAmount: Number(targetAmount),
        deadline,
        description: description || "",
        savedAmount: savedAmount ? Number(savedAmount) : 0,
        monthlySavingsAmount: monthlySavingsAmount
          ? Number(monthlySavingsAmount)
          : 0,
        status: "active", // FORCE ACTIVE ON CREATION
        imageUrl: req.file
          ? req.file.path.replace(/\\/g, "/")
          : "default-product.jpg",
      });

      console.log(`Goal created: ${goal._id}, Status: ${goal.status}`);
      res.status(201).json(goal);
    } catch (error) {
      next(error);
    }
  });
};

export const getGoals = async (req, res, next) => {
  try {
    const goals = await Goal.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(goals);
  } catch (err) {
    next(err);
  }
};

export const deleteGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      res.status(404);
      throw new Error("Goal not found");
    }

    if (goal.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error("User not authorized");
    }

    // Delete image file if not default
    if (goal.imageUrl && goal.imageUrl !== "default-product.jpg") {
      const imgPath = path.join(process.cwd(), goal.imageUrl);
      if (fs.existsSync(imgPath)) {
        fs.unlinkSync(imgPath);
      }
    }

    await Goal.findByIdAndDelete(req.params.id);
    res.status(204).json({ message: "Goal deleted" });
  } catch (err) {
    next(err);
  }
};

export const updateGoal = async (req, res, next) => {
  uploadSingle(req, res, async (err) => {
    try {
      if (err) {
        res.status(400);
        throw new Error(err.message);
      }

      const { id } = req.params;
      const goal = await Goal.findById(id);

      if (!goal) {
        res.status(404);
        throw new Error("Goal not found");
      }

      if (goal.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error("User not authorized");
      }

      const updateData = { ...req.body };
      delete updateData._id;
      delete updateData.user;
      delete updateData.__v;
      delete updateData.createdAt;
      delete updateData.updatedAt;

      if (req.file) {
        // Delete old image if not default
        if (goal.imageUrl && goal.imageUrl !== "default-product.jpg") {
          const oldPath = path.join(process.cwd(), goal.imageUrl);
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
          }
        }
        updateData.imageUrl = req.file.path.replace(/\\/g, "/");
      }

      // Ensure types are correct if they are being updated
      if (updateData.targetAmount)
        updateData.targetAmount = Number(updateData.targetAmount);
      if (updateData.savedAmount)
        updateData.savedAmount = Number(updateData.savedAmount);
      if (updateData.monthlySavingsAmount)
        updateData.monthlySavingsAmount = Number(
          updateData.monthlySavingsAmount,
        );
      if (updateData.savedAmount)
        updateData.savedAmount = Number(updateData.savedAmount);

      const updatedGoal = await Goal.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true },
      );

      res.json(updatedGoal);
    } catch (error) {
      next(error);
    }
  });
};

// @desc    Record a contribution to savings goal
// @route   PATCH /api/goals/:id/contribute
// @access  Private
export const recordContribution = async (req, res, next) => {
  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal) {
      res.status(404);
      throw new Error("Goal not found");
    }

    const amount = Number(req.body.amount);
    if (isNaN(amount) || amount <= 0) {
      res.status(400);
      throw new Error("Valid contribution amount is required");
    }

    goal.savedAmount = (goal.savedAmount || 0) + amount;

    // Auto-complete ONLY if target is strictly reached and it's active
    if (
      goal.status === "active" &&
      goal.savedAmount >= (goal.targetAmount || 0)
    ) {
      goal.status = "completed";
    }

    await goal.save();

    // Create a transaction record
    await Transaction.create({
      user: req.user._id,
      type: "expense",
      amount: amount,
      category: "Savings",
      notes: `Contribution to goal: ${goal.title}`,
      date: new Date(),
    });

    res.json(goal);
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle goal status (active/completed)
// @route   PATCH /api/goals/:id/status
// @access  Private
export const toggleGoalStatus = async (req, res, next) => {
  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal) {
      res.status(404);
      throw new Error("Goal not found");
    }

    if (goal.status === "active") {
      goal.status = "completed";
      // Set progress to 100% when finishing early
      goal.savedAmount = goal.targetAmount;
    } else {
      goal.status = "active";
    }
    await goal.save();
    res.json(goal);
  } catch (err) {
    next(err);
  }
};
